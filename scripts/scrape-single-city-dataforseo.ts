import { PrismaClient } from '@prisma/client'
import { DataForSEOScraper } from './scraper/dataforseo'

const prisma = new PrismaClient()

async function scrapeSingleCity(citySlug: string) {
  console.log(`🚀 Scraping avec DataForSEO pour la ville: ${citySlug}\n`)

  try {
    // Vérifier les credentials
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      console.error('❌ Erreur: DATAFORSEO_LOGIN et DATAFORSEO_PASSWORD requis dans .env')
      process.exit(1)
    }

    // Récupérer la ville
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    })

    if (!city) {
      console.error(`❌ Ville "${citySlug}" introuvable`)
      process.exit(1)
    }

    console.log(`📍 Ville trouvée: ${city.name}`)
    console.log(`   Département: ${city.department}`)
    console.log(`   Région: ${city.region}`)
    console.log(`   Population: ${city.population?.toLocaleString() || 'N/A'}`)
    console.log(`   Entreprises existantes: ${city._count.businesses}`)
    console.log(``)

    // Initialiser le scraper DataForSEO
    const scraper = new DataForSEOScraper({
      login: process.env.DATAFORSEO_LOGIN,
      password: process.env.DATAFORSEO_PASSWORD
    })

    console.log(`✅ Scraper DataForSEO initialisé\n`)

    // Vérifier les crédits
    await scraper.checkCredits()
    console.log(``)

    // Scraper la ville
    console.log(`🔍 Recherche d'installateurs de panneaux photovoltaïques à ${city.name}...\n`)
    
    const startTime = Date.now()
    const businesses = await scraper.scrapeCity(
      city.name,
      city.postalCode,
      city.latitude,
      city.longitude
    )
    const duration = Date.now() - startTime

    console.log(`\n✅ Scraping terminé en ${(duration / 1000).toFixed(1)}s`)
    console.log(`   Entreprises trouvées: ${businesses.length}`)

    // Enregistrer les entreprises dans la base de données
    let savedCount = 0
    let errorCount = 0

    if (businesses.length > 0) {
      console.log(`\n💾 Enregistrement dans la base de données...`)
      
      for (const business of businesses) {
        try {
          await prisma.business.create({
            data: {
              name: business.name,
              address: business.address,
              postalCode: business.postalCode || city.postalCode,
              cityId: city.id,
              phone: business.phone,
              website: business.website,
              rating: business.rating,
              reviewCount: business.reviewCount,
              latitude: business.latitude,
              longitude: business.longitude,
              openingHours: business.openingHours ? JSON.stringify(business.openingHours) : null,
              services: business.services?.join(', '),
              scraped: true,
              verified: false
            }
          })
          savedCount++
          console.log(`   ✅ ${savedCount}/${businesses.length} - ${business.name}`)
        } catch (error: any) {
          errorCount++
          console.log(`   ⚠️  Erreur pour "${business.name}": ${error.message}`)
        }
      }

      // Log du scraping
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: errorCount === 0 ? 'success' : errorCount < businesses.length ? 'partial' : 'error',
          itemsFound: businesses.length,
          itemsSaved: savedCount,
          duration: duration,
          metadata: JSON.stringify({ source: 'DataForSEO' })
        }
      })

      console.log(`\n📊 Résumé:`)
      console.log(`   Entreprises enregistrées: ${savedCount}`)
      if (errorCount > 0) {
        console.log(`   Erreurs: ${errorCount}`)
      }
    } else {
      console.log(`\n⚠️  Aucune entreprise trouvée`)
      
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: 'error',
          itemsFound: 0,
          itemsSaved: 0,
          duration: duration,
          error: 'Aucune entreprise trouvée',
          metadata: JSON.stringify({ source: 'DataForSEO' })
        }
      })
    }

    // Afficher le total
    const updatedCity = await prisma.city.findUnique({
      where: { slug: citySlug },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    })

    console.log(`\n📊 Total d'entreprises pour ${city.name}: ${updatedCity?._count.businesses || 0}`)

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Récupérer le slug de la ville depuis les arguments
const citySlug = process.argv[2]

if (!citySlug) {
  console.error('❌ Usage: npx tsx scripts/scrape-single-city-dataforseo.ts <city-slug>')
  console.error('   Exemple: npx tsx scripts/scrape-single-city-dataforseo.ts le-puy-en-velay')
  process.exit(1)
}

scrapeSingleCity(citySlug)
  .then(() => {
    console.log('\n✅ Opération terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
