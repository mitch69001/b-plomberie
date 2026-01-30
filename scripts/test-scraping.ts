/**
 * Script de test rapide du scraping sur UNE ville
 */

import { PrismaClient } from '@prisma/client'
import { ScrapingOrchestrator } from './scraper/orchestrator'

const prisma = new PrismaClient()

async function testScraping() {
  console.log('🧪 Test du système de scraping\n')
  
  // Récupérer Paris pour le test
  const paris = await prisma.city.findUnique({
    where: { slug: 'paris' }
  })
  
  if (!paris) {
    console.error('❌ Ville Paris non trouvée dans la base')
    process.exit(1)
  }
  
  console.log(`📍 Test sur : ${paris.name} (${paris.postalCode})\n`)
  
  // Configuration de test (utiliser DataForSEO)
  const orchestrator = new ScrapingOrchestrator({
    enableDataForSEO: true,      // DataForSEO (recommandé)
    enableGoogleMaps: false,     // Désactivé car DataForSEO fait déjà Google
    enablePagesJaunes: false,    // Désactivé (403 errors)
    enableRGE: false,            // Désactivé pour test rapide
    batchSize: 1,                // Une seule ville
    delayBetweenCities: 0,       // Pas de délai
  })
  
  await orchestrator.init()
  await orchestrator.scrapeCities([paris.id])
  
  // Vérifier les résultats
  const businessCount = await prisma.business.count({
    where: { cityId: paris.id }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSULTAT DU TEST')
  console.log('='.repeat(60))
  console.log(`✅ Entreprises trouvées : ${businessCount}`)
  console.log('='.repeat(60))
  
  if (businessCount > 0) {
    console.log('\n✨ Test réussi ! Le scraping fonctionne.')
    console.log('\nVous pouvez maintenant :')
    console.log('1. Vérifier les données sur http://localhost:3000/photovoltaique/paris')
    console.log('2. Lancer le scraping complet : npx tsx scripts/scraper/orchestrator.ts')
  } else {
    console.log('\n⚠️  Aucune entreprise trouvée.')
    console.log('Cela peut être normal si les sites bloquent le scraping.')
    console.log('Essayez de modifier les paramètres ou d\'utiliser des proxies.')
  }
}

testScraping()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
