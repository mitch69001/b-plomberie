/**
 * Script pour scraper les villes vides avec DataForSEO
 * Plus fiable et professionnel que Puppeteer
 */

import { ScrapingOrchestrator } from './scraper/orchestrator'

async function main() {
  console.log('🚀 Scraping avec DataForSEO\n')
  
  // Vérifier les credentials
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    console.error('❌ Erreur: DATAFORSEO_LOGIN et DATAFORSEO_PASSWORD requis dans .env')
    console.log('\nAjoutez ces lignes à votre fichier .env:')
    console.log('DATAFORSEO_LOGIN="votre-login"')
    console.log('DATAFORSEO_PASSWORD="votre-password"')
    process.exit(1)
  }

  // Créer l'orchestrateur avec DataForSEO
  const orchestrator = new ScrapingOrchestrator({
    enableDataForSEO: true,   // ✅ Source principale (API fiable)
    enableGoogleMaps: false,   // ❌ Pas besoin avec DataForSEO
    enablePagesJaunes: false,  // ❌ Peut causer des problèmes
    enableRGE: true,           // ✅ Complément RGE
    batchSize: 50,             // Traiter 50 villes vides
    delayBetweenCities: 3000,  // 3 secondes entre chaque ville
  })

  try {
    // Initialiser et vérifier les crédits
    await orchestrator.init()
    
    // Lancer le scraping
    await orchestrator.scrapeCities()
    
    console.log('\n✅ Scraping terminé avec succès!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  }
}

main()
