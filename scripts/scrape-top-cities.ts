import { PrismaClient } from '@prisma/client'
import { ScrapingOrchestrator } from './scraper/orchestrator'

const prisma = new PrismaClient()

// Liste des villes à scraper
const cityNames = [
  'Nantes',
  'Strasbourg', 
  'Montpellier',
  'Lille',
  'Rennes',
  'Reims',
  'Saint-Étienne',
  'Le Havre',
  'Toulon',
  'Grenoble',
  'Dijon',
  'Angers',
  'Nîmes',
  'Villeurbanne',
  'Clermont-Ferrand'
]

async function scrapeTopCities() {
  console.log('🔍 Scraping des 15 grandes villes...\n')

  // Récupérer les IDs des villes
  const cities = await prisma.city.findMany({
    where: {
      name: {
        in: cityNames
      }
    },
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true
    }
  })

  console.log(`📊 ${cities.length} ville(s) trouvée(s) dans la base\n`)

  if (cities.length === 0) {
    console.log('❌ Aucune ville à scraper')
    return
  }

  // Initialiser le scraper
  const orchestrator = new ScrapingOrchestrator({
    enableDataForSEO: true,
    enableGoogleMaps: false,
    enablePagesJaunes: false,
    enableRGE: false
  })

  await orchestrator.init()

  // Lancer le scraping
  const cityIds = cities.map(c => c.id)
  
  console.log('🚀 Lancement du scraping...\n')
  console.log('⏱️  Cela peut prendre plusieurs minutes...\n')

  try {
    await orchestrator.scrapeCities(cityIds)
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Scraping terminé!\n')

    // Afficher les résultats par ville
    console.log('📊 Résultats par ville:\n')
    
    for (const city of cities) {
      const businessCount = await prisma.business.count({
        where: { 
          cityId: city.id,
          scraped: true
        }
      })
      
      const status = businessCount > 0 ? '✅' : '⚠️'
      console.log(`   ${status} ${city.name}: ${businessCount} entreprise(s)`)
      
      // Créer un log de scraping
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: businessCount > 0 ? 'success' : 'partial',
          itemsFound: businessCount,
          itemsSaved: businessCount,
          duration: 0
        }
      })
    }

    // Total global
    const totalBusinesses = await prisma.business.count({
      where: { scraped: true }
    })

    console.log('\n📊 Total entreprises dans la base: ' + totalBusinesses)

  } catch (error: any) {
    console.error('\n❌ Erreur lors du scraping:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

scrapeTopCities()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
