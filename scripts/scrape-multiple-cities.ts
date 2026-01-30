/**
 * Script pour scraper plusieurs villes à la fois
 */

import { PrismaClient } from '@prisma/client'
import { ScrapingOrchestrator } from './scraper/orchestrator'

const prisma = new PrismaClient()

async function scrapeMultipleCities() {
  console.log('🚀 Scraping de plusieurs villes...\n')
  
  // Récupérer les villes à scraper (celles sans entreprises)
  const cities = await prisma.city.findMany({
    include: {
      _count: {
        select: { businesses: true }
      }
    },
    where: {
      businesses: {
        none: {}
      }
    },
    take: 5, // Limiter à 5 villes pour le test
  })
  
  if (cities.length === 0) {
    console.log('✅ Toutes les villes ont déjà des entreprises')
    return
  }
  
  console.log(`📍 ${cities.length} ville(s) à scraper:`)
  cities.forEach(city => {
    console.log(`   - ${city.name} (${city.region})`)
  })
  console.log('')
  
  const orchestrator = new ScrapingOrchestrator({
    enableDataForSEO: true,
    enableGoogleMaps: false,
    enablePagesJaunes: false,
    enableRGE: false,
    batchSize: 5,
    delayBetweenCities: 3000, // 3 secondes entre chaque ville
  })
  
  await orchestrator.init()
  await orchestrator.scrapeCities(cities.map(c => c.id))
}

scrapeMultipleCities()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
