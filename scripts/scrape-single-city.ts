/**
 * Script pour scraper une seule ville (pour test)
 * Usage: npx tsx scripts/scrape-single-city.ts <slug-ville>
 * Exemple: npx tsx scripts/scrape-single-city.ts paris
 */

import { PrismaClient } from '@prisma/client'
import { GoogleMapsScraper } from './scraper/google-maps'

const prisma = new PrismaClient()

async function scrapeSingleCity(citySlug?: string) {
  try {
    // 1. Récupérer la ville
    let city
    
    if (citySlug) {
      console.log(`🔍 Recherche de la ville: ${citySlug}`)
      city = await prisma.city.findUnique({
        where: { slug: citySlug },
        include: {
          _count: {
            select: { businesses: true }
          }
        }
      })
    } else {
      // Prendre une ville aléatoire sans données
      console.log('🔍 Recherche d\'une ville sans données...')
      const cities = await prisma.city.findMany({
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
        take: 1,
        orderBy: {
          population: 'desc'
        }
      })
      city = cities[0]
    }

    if (!city) {
      console.error('❌ Ville non trouvée')
      process.exit(1)
    }

    console.log('\n' + '='.repeat(80))
    console.log(`📍 VILLE: ${city.name}`)
    console.log('='.repeat(80))
    console.log(`Code postal: ${city.postalCode}`)
    console.log(`Département: ${city.department}`)
    console.log(`Région: ${city.region}`)
    console.log(`Population: ${city.population?.toLocaleString() || 'N/A'} habitants`)
    console.log(`Entreprises actuelles: ${city._count.businesses}`)
    console.log('='.repeat(80))

    // 2. Confirmer si la ville a déjà des données
    if (city._count.businesses > 0) {
      console.log(`\n⚠️  Cette ville a déjà ${city._count.businesses} entreprise(s)`)
      console.log('Voulez-vous continuer quand même ? (Les doublons seront ignorés)')
    }

    // 3. Initialiser le scraper
    console.log('\n🌐 Initialisation du scraper...')
    const scraper = new GoogleMapsScraper()
    await scraper.init()

    // 4. Scraper la ville
    console.log('\n🔍 Début du scraping...\n')
    const businesses = await scraper.scrapeCity(city.name, city.postalCode)
    
    console.log(`\n📊 Résultats du scraping:`)
    console.log(`   Entreprises trouvées: ${businesses.length}`)

    // 5. Afficher les entreprises trouvées
    if (businesses.length > 0) {
      console.log('\n📋 Liste des entreprises:')
      businesses.forEach((business, index) => {
        console.log(`\n${index + 1}. ${business.name}`)
        console.log(`   Adresse: ${business.address}`)
        if (business.rating) {
          console.log(`   Note: ${business.rating}/5 (${business.reviewCount || 0} avis)`)
        }
      })

      // 6. Sauvegarder dans la base de données
      console.log(`\n💾 Sauvegarde dans la base de données...`)
      
      let saved = 0
      let skipped = 0
      
      for (const business of businesses) {
        try {
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
          saved++
        } catch (err: any) {
          if (err.message?.includes('Unique constraint')) {
            skipped++
          } else {
            console.error(`   ⚠️  Erreur: ${err.message}`)
          }
        }
      }

      console.log(`\n✅ Sauvegarde terminée:`)
      console.log(`   Nouvelles entreprises: ${saved}`)
      console.log(`   Doublons ignorés: ${skipped}`)

      // 7. Log de scraping
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: businesses.length > 0 ? 'success' : 'partial',
          itemsFound: businesses.length,
          itemsSaved: saved,
          metadata: JSON.stringify({
            population: city.population,
            department: city.department,
            region: city.region,
          })
        }
      })
    } else {
      console.log('\n⚠️  Aucune entreprise trouvée pour cette ville')
      
      await prisma.scrapingLog.create({
        data: {
          cityId: city.id,
          cityName: city.name,
          status: 'partial',
          itemsFound: 0,
          itemsSaved: 0,
        }
      })
    }

    // 8. Fermer le scraper
    await scraper.close()

    // 9. Statistiques finales
    const updatedCity = await prisma.city.findUnique({
      where: { id: city.id },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    })

    console.log('\n' + '='.repeat(80))
    console.log('📊 ÉTAT FINAL')
    console.log('='.repeat(80))
    console.log(`Entreprises avant: ${city._count.businesses}`)
    console.log(`Entreprises après: ${updatedCity?._count.businesses}`)
    console.log(`Nouvelles: +${(updatedCity?._count.businesses || 0) - city._count.businesses}`)
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
const citySlug = process.argv[2]

if (citySlug) {
  console.log(`🎯 Mode: Scraping de la ville "${citySlug}"`)
} else {
  console.log('🎲 Mode: Scraping d\'une ville aléatoire sans données')
}

scrapeSingleCity(citySlug)
  .then(() => {
    console.log('\n✅ Script terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
