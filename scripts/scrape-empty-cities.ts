/**
 * Script pour scraper les installateurs pour les villes sans données
 */

import { PrismaClient } from '@prisma/client'
import { GoogleMapsScraper } from './scraper/google-maps'

const prisma = new PrismaClient()

interface ScrapingStats {
  citiesScraped: number
  businessesFound: number
  businessesSaved: number
  errors: number
}

async function scrapeEmptyCities() {
  console.log('🚀 Début du scraping des villes vides...\n')
  
  const stats: ScrapingStats = {
    citiesScraped: 0,
    businessesFound: 0,
    businessesSaved: 0,
    errors: 0,
  }

  try {
    // 1. Récupérer les villes sans businesses
    console.log('📊 Récupération des villes vides...')
    const emptyCities = await prisma.city.findMany({
      where: {
        businesses: {
          none: {}
        }
      },
      orderBy: {
        population: 'desc' // Commencer par les plus grandes villes
      },
      take: 50 // Limiter à 50 villes pour commencer
    })

    console.log(`✅ ${emptyCities.length} villes sans données trouvées\n`)

    if (emptyCities.length === 0) {
      console.log('✨ Toutes les villes ont déjà des données !')
      return
    }

    // 2. Initialiser le scraper
    const scraper = new GoogleMapsScraper()
    await scraper.init()

    console.log('🔍 Début du scraping...\n')
    console.log('='.repeat(80))

    // 3. Scraper chaque ville
    for (const city of emptyCities) {
      try {
        console.log(`\n📍 Ville ${stats.citiesScraped + 1}/${emptyCities.length}: ${city.name} (${city.postalCode})`)
        console.log(`   Population: ${city.population?.toLocaleString() || 'N/A'} habitants`)
        console.log(`   Département: ${city.department}, Région: ${city.region}`)
        
        // Scraper la ville
        const businesses = await scraper.scrapeCity(city.name, city.postalCode)
        stats.businessesFound += businesses.length

        // Sauvegarder dans la base de données
        if (businesses.length > 0) {
          console.log(`\n   💾 Sauvegarde de ${businesses.length} entreprises...`)
          
          for (const business of businesses) {
            try {
              // Extraire le code postal de l'adresse si possible
              const postalMatch = business.address.match(/\b\d{5}\b/)
              const businessPostalCode = postalMatch?.[0] || city.postalCode

              await prisma.business.create({
                data: {
                  name: business.name,
                  address: business.address,
                  postalCode: businessPostalCode,
                  cityId: city.id,
                  phone: business.phone || null,
                  website: business.website || null,
                  rating: business.rating || null,
                  reviewCount: business.reviewCount || null,
                  latitude: business.latitude || null,
                  longitude: business.longitude || null,
                  services: business.services?.join(',') || null,
                  scraped: true,
                  verified: false,
                }
              })
              stats.businessesSaved++
            } catch (err: any) {
              // Ignorer les doublons ou autres erreurs de création
              if (!err.message?.includes('Unique constraint')) {
                console.error(`      ⚠️  Erreur sauvegarde: ${err.message}`)
              }
            }
          }
          
          console.log(`   ✅ ${businesses.length} entreprises sauvegardées`)
        } else {
          console.log(`   ⚠️  Aucune entreprise trouvée`)
        }

        stats.citiesScraped++

        // Log de scraping
        await prisma.scrapingLog.create({
          data: {
            cityId: city.id,
            cityName: city.name,
            status: businesses.length > 0 ? 'success' : 'partial',
            itemsFound: businesses.length,
            itemsSaved: businesses.length,
            metadata: JSON.stringify({
              population: city.population,
              department: city.department,
              region: city.region,
            })
          }
        })

        // Pause entre les villes pour éviter d'être bloqué
        console.log(`   ⏸️  Pause de 3 secondes...`)
        await delay(3000)

      } catch (error: any) {
        stats.errors++
        console.error(`\n   ❌ Erreur pour ${city.name}: ${error.message}`)
        
        // Log d'erreur
        await prisma.scrapingLog.create({
          data: {
            cityId: city.id,
            cityName: city.name,
            status: 'error',
            itemsFound: 0,
            itemsSaved: 0,
            error: error.message,
          }
        })
      }
    }

    // 4. Fermer le scraper
    await scraper.close()

    // 5. Afficher les statistiques finales
    console.log('\n' + '='.repeat(80))
    console.log('📊 STATISTIQUES FINALES')
    console.log('='.repeat(80))
    console.log(`🏙️  Villes scrapées: ${stats.citiesScraped}/${emptyCities.length}`)
    console.log(`🔍 Entreprises trouvées: ${stats.businessesFound}`)
    console.log(`💾 Entreprises sauvegardées: ${stats.businessesSaved}`)
    console.log(`❌ Erreurs: ${stats.errors}`)
    console.log('='.repeat(80))

    // 6. Statistiques globales
    const totalCities = await prisma.city.count()
    const citiesWithBusinesses = await prisma.city.count({
      where: {
        businesses: {
          some: {}
        }
      }
    })
    const totalBusinesses = await prisma.business.count()

    console.log('\n📈 ÉTAT GLOBAL DE LA BASE')
    console.log('='.repeat(80))
    console.log(`🏙️  Total villes: ${totalCities}`)
    console.log(`✅ Villes avec données: ${citiesWithBusinesses} (${Math.round(citiesWithBusinesses / totalCities * 100)}%)`)
    console.log(`⚪ Villes sans données: ${totalCities - citiesWithBusinesses}`)
    console.log(`🏢 Total entreprises: ${totalBusinesses}`)
    console.log(`📊 Moyenne: ${(totalBusinesses / citiesWithBusinesses).toFixed(1)} entreprises/ville`)
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Exécution
scrapeEmptyCities()
  .then(() => {
    console.log('\n✅ Scraping terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
