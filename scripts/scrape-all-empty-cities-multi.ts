import { PrismaClient } from '@prisma/client'
import { DataForSEOScraper, BusinessData } from './scraper/dataforseo'

const prisma = new PrismaClient()

// Variantes de mots-clés à tester
const KEYWORD_VARIANTS = [
  'panneaux photovoltaiques',
  'installateur panneaux solaires',
  'installation photovoltaique',
  'panneaux solaires',
  'installateur photovoltaique',
  'energie solaire'
]

async function scrapeAllEmptyCities() {
  console.log(`🚀 Scraping de toutes les villes vides avec multi-mots-clés\n`)

  try {
    // Vérifier les credentials
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      console.error('❌ Erreur: DATAFORSEO_LOGIN et DATAFORSEO_PASSWORD requis dans .env')
      process.exit(1)
    }

    // Récupérer toutes les villes sans entreprises
    const emptyCities = await prisma.city.findMany({
      where: {
        businesses: {
          none: {}
        }
      },
      include: {
        _count: {
          select: { businesses: true }
        }
      },
      orderBy: {
        population: 'desc'
      }
    })

    if (emptyCities.length === 0) {
      console.log('✅ Toutes les villes ont déjà des entreprises!')
      return
    }

    console.log(`📊 ${emptyCities.length} ville(s) vide(s) à scraper\n`)

    // Initialiser le scraper
    const scraper = new DataForSEOScraper({
      login: process.env.DATAFORSEO_LOGIN,
      password: process.env.DATAFORSEO_PASSWORD
    })

    // Vérifier les crédits
    const credits = await scraper.checkCredits()
    console.log('')

    // Statistiques globales
    let totalCitiesProcessed = 0
    let totalBusinessesFound = 0
    let totalBusinessesSaved = 0

    // Traiter chaque ville
    for (const city of emptyCities) {
      console.log(`\n${'='.repeat(70)}`)
      console.log(`📍 [${totalCitiesProcessed + 1}/${emptyCities.length}] ${city.name}`)
      console.log(`   Département: ${city.department} | Région: ${city.region}`)
      console.log(`   Population: ${city.population?.toLocaleString() || 'N/A'}`)
      console.log(`${'='.repeat(70)}\n`)

      const allBusinesses = new Map<string, BusinessData>()
      let cityTotalFound = 0

      // Tester chaque variante de mot-clé
      for (const keyword of KEYWORD_VARIANTS) {
        console.log(`   🔍 "${keyword}"...`)

        try {
          const businesses = await scrapeWithCustomKeyword(
            scraper,
            keyword,
            city.name,
            city.postalCode,
            city.latitude,
            city.longitude
          )

          if (businesses.length > 0) {
            console.log(`      ✅ ${businesses.length} trouvée(s)`)
          } else {
            console.log(`      ⚠️  Aucune`)
          }

          cityTotalFound += businesses.length

          // Ajouter les entreprises uniques
          for (const business of businesses) {
            const key = `${business.name.toLowerCase()}-${business.address.toLowerCase()}`
            if (!allBusinesses.has(key)) {
              allBusinesses.set(key, business)
            }
          }

          // Délai entre les requêtes
          await delay(2000)

        } catch (error: any) {
          console.log(`      ❌ Erreur: ${error.message}`)
        }
      }

      const uniqueBusinesses = Array.from(allBusinesses.values())
      totalBusinessesFound += uniqueBusinesses.length

      console.log(`\n   📊 Résumé pour ${city.name}:`)
      console.log(`      Total trouvé: ${cityTotalFound}`)
      console.log(`      Uniques: ${uniqueBusinesses.length}`)

      // Enregistrer dans la base de données
      if (uniqueBusinesses.length > 0) {
        console.log(`\n   💾 Enregistrement...`)
        
        let savedCount = 0
        let skippedCount = 0

        for (const business of uniqueBusinesses) {
          try {
            // Vérifier si l'entreprise existe déjà
            const existing = await prisma.business.findFirst({
              where: {
                name: business.name,
                cityId: city.id
              }
            })

            if (existing) {
              skippedCount++
              continue
            }

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
            console.log(`      ✅ ${business.name}`)
          } catch (error: any) {
            console.log(`      ⚠️  Erreur: ${error.message}`)
          }
        }

        totalBusinessesSaved += savedCount

        // Log du scraping
        await prisma.scrapingLog.create({
          data: {
            cityId: city.id,
            cityName: city.name,
            status: savedCount > 0 ? 'success' : 'partial',
            itemsFound: uniqueBusinesses.length,
            itemsSaved: savedCount,
            metadata: JSON.stringify({ 
              source: 'DataForSEO-MultiKeywords',
              keywords: KEYWORD_VARIANTS
            })
          }
        })

        console.log(`\n      ✅ ${savedCount} enregistrée(s)`)
        if (skippedCount > 0) {
          console.log(`      ⏭️  ${skippedCount} déjà existante(s)`)
        }
      } else {
        console.log(`\n      ⚠️  Aucune entreprise trouvée`)
        
        await prisma.scrapingLog.create({
          data: {
            cityId: city.id,
            cityName: city.name,
            status: 'error',
            itemsFound: 0,
            itemsSaved: 0,
            error: 'Aucune entreprise trouvée',
            metadata: JSON.stringify({ 
              source: 'DataForSEO-MultiKeywords',
              keywords: KEYWORD_VARIANTS
            })
          }
        })
      }

      totalCitiesProcessed++

      // Pause entre les villes
      console.log(`\n   ⏸️  Pause de 3s avant la prochaine ville...`)
      await delay(3000)
    }

    // Statistiques finales
    console.log(`\n${'='.repeat(70)}`)
    console.log(`\n✅ SCRAPING TERMINÉ!\n`)
    console.log(`📊 Statistiques globales:`)
    console.log(`   Villes traitées: ${totalCitiesProcessed}`)
    console.log(`   Entreprises trouvées: ${totalBusinessesFound}`)
    console.log(`   Entreprises enregistrées: ${totalBusinessesSaved}`)
    console.log(`   Moyenne par ville: ${(totalBusinessesSaved / totalCitiesProcessed).toFixed(1)}`)
    console.log(`\n${'='.repeat(70)}`)

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function scrapeWithCustomKeyword(
  scraper: DataForSEOScraper,
  keyword: string,
  cityName: string,
  postalCode: string,
  latitude: number,
  longitude: number | null
): Promise<BusinessData[]> {
  const fullKeyword = `${keyword} ${cityName}`
  const scraperAny = scraper as any
  
  try {
    const results = await scraperAny.searchGoogleMaps(fullKeyword, latitude, longitude)
    return results
  } catch (error) {
    throw error
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

scrapeAllEmptyCities()
  .then(() => {
    console.log('\n✅ Opération terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
