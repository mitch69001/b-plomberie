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

async function scrapeWithMultipleKeywords(citySlug: string) {
  console.log(`🚀 Scraping multi-mots-clés avec DataForSEO\n`)

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

    console.log(`📍 Ville: ${city.name}`)
    console.log(`   Département: ${city.department}`)
    console.log(`   Région: ${city.region}`)
    console.log(`   Entreprises existantes: ${city._count.businesses}\n`)

    // Initialiser le scraper
    const scraper = new DataForSEOScraper({
      login: process.env.DATAFORSEO_LOGIN,
      password: process.env.DATAFORSEO_PASSWORD
    })

    // Vérifier les crédits
    const credits = await scraper.checkCredits()
    if (credits <= 0) {
      console.warn('⚠️  Attention: Crédits à $0.00 - Les requêtes pourraient échouer\n')
    }

    // Tester chaque variante de mot-clé
    const allBusinesses = new Map<string, BusinessData>() // Utiliser Map pour éviter les doublons
    let totalFound = 0
    let totalRequests = 0

    for (const keyword of KEYWORD_VARIANTS) {
      console.log(`\n🔍 Test du mot-clé: "${keyword} ${city.name}"`)
      totalRequests++

      try {
        const businesses = await scrapeWithCustomKeyword(
          scraper,
          keyword,
          city.name,
          city.postalCode,
          city.latitude,
          city.longitude
        )

        console.log(`   ✅ ${businesses.length} entreprise(s) trouvée(s)`)
        totalFound += businesses.length

        // Ajouter les entreprises uniques (éviter les doublons par nom + adresse)
        for (const business of businesses) {
          const key = `${business.name.toLowerCase()}-${business.address.toLowerCase()}`
          if (!allBusinesses.has(key)) {
            allBusinesses.set(key, business)
          }
        }

        // Délai entre les requêtes pour éviter le rate limiting
        await delay(2000)

      } catch (error: any) {
        console.log(`   ❌ Erreur: ${error.message}`)
      }
    }

    const uniqueBusinesses = Array.from(allBusinesses.values())

    console.log(`\n📊 Résumé du scraping:`)
    console.log(`   Requêtes effectuées: ${totalRequests}`)
    console.log(`   Total trouvé: ${totalFound}`)
    console.log(`   Entreprises uniques: ${uniqueBusinesses.length}`)

    // Enregistrer dans la base de données
    if (uniqueBusinesses.length > 0) {
      console.log(`\n💾 Enregistrement dans la base de données...`)
      
      let savedCount = 0
      let skippedCount = 0
      let errorCount = 0

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
            console.log(`   ⏭️  ${business.name} (déjà existant)`)
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
          console.log(`   ✅ ${savedCount}/${uniqueBusinesses.length} - ${business.name}`)
        } catch (error: any) {
          errorCount++
          console.log(`   ⚠️  Erreur: ${error.message}`)
        }
      }

      // Log du scraping
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: errorCount === 0 ? 'success' : errorCount < uniqueBusinesses.length ? 'partial' : 'error',
          itemsFound: uniqueBusinesses.length,
          itemsSaved: savedCount,
          metadata: JSON.stringify({ 
            source: 'DataForSEO-MultiKeywords',
            keywords: KEYWORD_VARIANTS,
            totalRequests: totalRequests
          })
        }
      })

      console.log(`\n✅ Résumé final:`)
      console.log(`   Enregistrées: ${savedCount}`)
      console.log(`   Déjà existantes: ${skippedCount}`)
      if (errorCount > 0) {
        console.log(`   Erreurs: ${errorCount}`)
      }
    } else {
      console.log(`\n⚠️  Aucune entreprise trouvée avec aucun des mots-clés`)
      
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

async function scrapeWithCustomKeyword(
  scraper: DataForSEOScraper,
  keyword: string,
  cityName: string,
  postalCode: string,
  latitude: number,
  longitude: number | null
): Promise<BusinessData[]> {
  // Utiliser une méthode interne du scraper en construisant la recherche manuellement
  const fullKeyword = `${keyword} ${cityName}`
  
  // Accéder à la méthode privée via any (hack temporaire)
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

// Récupérer le slug de la ville depuis les arguments
const citySlug = process.argv[2]

if (!citySlug) {
  console.error('❌ Usage: npx tsx scripts/scrape-city-multi-keywords.ts <city-slug>')
  console.error('   Exemple: npx tsx scripts/scrape-city-multi-keywords.ts le-puy-en-velay')
  process.exit(1)
}

scrapeWithMultipleKeywords(citySlug)
  .then(() => {
    console.log('\n✅ Opération terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
