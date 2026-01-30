/**
 * Orchestrateur de scraping
 * Coordonne les différentes sources et enrichit les données
 */

import { PrismaClient } from '@prisma/client'
import { GoogleMapsScraper, BusinessData } from './google-maps'
import { PagesJaunesScraper } from './pages-jaunes'
import { RGEScraper } from './rge-scraper'
import { DataForSEOScraper } from './dataforseo'

const prisma = new PrismaClient()

interface ScraperConfig {
  enableDataForSEO: boolean
  enableGoogleMaps: boolean
  enablePagesJaunes: boolean
  enableRGE: boolean
  batchSize: number
  delayBetweenCities: number
}

export class ScrapingOrchestrator {
  private config: ScraperConfig
  private dataForSEOScraper?: DataForSEOScraper
  private googleMapsScraper?: GoogleMapsScraper
  private pagesJaunesScraper: PagesJaunesScraper
  private rgeScraper: RGEScraper

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      enableDataForSEO: true, // Recommandé
      enableGoogleMaps: false, // Désactivé si DataForSEO activé
      enablePagesJaunes: false, // Peut causer des 403
      enableRGE: true,
      batchSize: 50,
      delayBetweenCities: 5000,
      ...config,
    }

    this.pagesJaunesScraper = new PagesJaunesScraper()
    this.rgeScraper = new RGEScraper()
  }

  async init() {
    // Initialiser DataForSEO
    if (this.config.enableDataForSEO) {
      const login = process.env.DATAFORSEO_LOGIN
      const password = process.env.DATAFORSEO_PASSWORD

      if (!login || !password) {
        throw new Error('DATAFORSEO_LOGIN et DATAFORSEO_PASSWORD requis dans .env')
      }

      this.dataForSEOScraper = new DataForSEOScraper({ login, password })
      
      // Vérifier les crédits
      await this.dataForSEOScraper.checkCredits()
    }

    // Initialiser Google Maps (fallback)
    if (this.config.enableGoogleMaps) {
      this.googleMapsScraper = new GoogleMapsScraper()
      await this.googleMapsScraper.init()
    }
  }

  async scrapeCities(cityIds?: string[]) {
    console.log('🚀 Démarrage du scraping...\n')
    console.log('Configuration:')
    console.log(`  - DataForSEO: ${this.config.enableDataForSEO ? '✅' : '❌'}`)
    console.log(`  - Google Maps: ${this.config.enableGoogleMaps ? '✅' : '❌'}`)
    console.log(`  - Pages Jaunes: ${this.config.enablePagesJaunes ? '✅' : '❌'}`)
    console.log(`  - Annuaire RGE: ${this.config.enableRGE ? '✅' : '❌'}`)
    console.log(`  - Batch size: ${this.config.batchSize}`)
    console.log('')

    try {
      // Récupérer les villes à scraper
      const cities = await this.getCitiesToScrape(cityIds)
      console.log(`📍 ${cities.length} villes à scraper\n`)

      let processed = 0
      let totalBusinesses = 0

      for (const city of cities) {
        try {
          console.log(`\n${'='.repeat(60)}`)
          console.log(`[${processed + 1}/${cities.length}] ${city.name} (${city.postalCode})`)
          console.log('='.repeat(60))

          const allBusinesses: BusinessData[] = []

          // Scraping DataForSEO (prioritaire)
          if (this.config.enableDataForSEO && this.dataForSEOScraper) {
            const dfsBusinesses = await this.dataForSEOScraper.scrapeCity(
              city.name,
              city.postalCode,
              city.latitude,
              city.longitude
            )
            allBusinesses.push(...dfsBusinesses)
          }

          // Scraping Google Maps (fallback)
          if (this.config.enableGoogleMaps && this.googleMapsScraper) {
            const gmBusinesses = await this.googleMapsScraper.scrapeCity(
              city.name,
              city.postalCode
            )
            allBusinesses.push(...gmBusinesses)
          }

          // Scraping Pages Jaunes
          if (this.config.enablePagesJaunes) {
            const pjBusinesses = await this.pagesJaunesScraper.scrapeCity(
              city.name,
              city.postalCode
            )
            allBusinesses.push(...pjBusinesses)
          }

          // Scraping RGE
          if (this.config.enableRGE) {
            const rgeBusinesses = await this.rgeScraper.scrapeCity(
              city.name,
              city.postalCode
            )
            allBusinesses.push(...rgeBusinesses)
          }

          // Déduplication et enrichissement
          const uniqueBusinesses = this.deduplicateBusinesses(allBusinesses)
          const enrichedBusinesses = await this.enrichBusinesses(uniqueBusinesses, city)

          // Sauvegarde en base de données
          const saved = await this.saveBusinesses(enrichedBusinesses, city.id)
          
          totalBusinesses += saved
          processed++

          console.log(`\n✅ ${saved} entreprises sauvegardées pour ${city.name}`)
          console.log(`📊 Progression: ${processed}/${cities.length} villes (${Math.round(processed/cities.length*100)}%)`)

          // Délai entre les villes
          if (processed < cities.length) {
            console.log(`⏳ Pause de ${this.config.delayBetweenCities/1000}s...`)
            await this.delay(this.config.delayBetweenCities)
          }

        } catch (error) {
          console.error(`❌ Erreur pour ${city.name}:`, error)
        }
      }

      console.log('\n' + '='.repeat(60))
      console.log('📊 RÉSUMÉ DU SCRAPING')
      console.log('='.repeat(60))
      console.log(`✅ Villes traitées: ${processed}/${cities.length}`)
      console.log(`🏢 Entreprises totales: ${totalBusinesses}`)
      console.log(`📈 Moyenne: ${Math.round(totalBusinesses/processed)} entreprises/ville`)
      console.log('='.repeat(60))

    } finally {
      await this.cleanup()
    }
  }

  private async getCitiesToScrape(cityIds?: string[]) {
    if (cityIds && cityIds.length > 0) {
      return await prisma.city.findMany({
        where: { id: { in: cityIds } },
        take: this.config.batchSize,
      })
    }

    // Récupérer les villes avec le moins d'entreprises scrapées
    return await prisma.city.findMany({
      take: this.config.batchSize,
      orderBy: {
        businesses: {
          _count: 'asc',
        },
      },
      where: {
        population: {
          gte: 5000, // Prioriser les villes de plus de 5000 habitants
        },
      },
    })
  }

  private deduplicateBusinesses(businesses: BusinessData[]): BusinessData[] {
    const unique = new Map<string, BusinessData>()

    businesses.forEach((business) => {
      const key = this.generateBusinessKey(business)
      
      if (!unique.has(key)) {
        unique.set(key, business)
      } else {
        // Merge data if duplicate
        const existing = unique.get(key)!
        unique.set(key, this.mergeBusinessData(existing, business))
      }
    })

    return Array.from(unique.values())
  }

  private generateBusinessKey(business: BusinessData): string {
    const name = business.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const address = business.address.toLowerCase().replace(/[^a-z0-9]/g, '')
    return `${name}-${address.substring(0, 20)}`
  }

  private mergeBusinessData(existing: BusinessData, newData: BusinessData): BusinessData {
    return {
      ...existing,
      phone: existing.phone || newData.phone,
      website: existing.website || newData.website,
      rating: existing.rating || newData.rating,
      reviewCount: existing.reviewCount || newData.reviewCount,
      latitude: existing.latitude || newData.latitude,
      longitude: existing.longitude || newData.longitude,
      services: [...new Set([...(existing.services || []), ...(newData.services || [])])],
    }
  }

  private async enrichBusinesses(
    businesses: BusinessData[],
    city: { latitude: number; longitude: number }
  ): Promise<BusinessData[]> {
    // Enrichissement futur : géocodage, validation téléphone, etc.
    return businesses
  }

  private async saveBusinesses(businesses: BusinessData[], cityId: string): Promise<number> {
    let saved = 0

    for (const business of businesses) {
      try {
        // Convertir services en string pour SQLite
        const servicesString = business.services && business.services.length > 0
          ? business.services.join(',')
          : null

        // Convertir openingHours en string JSON pour SQLite
        const openingHoursString = business.openingHours
          ? JSON.stringify(business.openingHours)
          : null

        await prisma.business.upsert({
          where: {
            id: `${cityId}-${this.generateBusinessKey(business)}`,
          },
          update: {
            name: business.name,
            address: business.address,
            postalCode: business.postalCode,
            phone: business.phone,
            website: business.website,
            rating: business.rating,
            reviewCount: business.reviewCount,
            latitude: business.latitude,
            longitude: business.longitude,
            services: servicesString,
            openingHours: openingHoursString,
            scraped: true,
            updatedAt: new Date(),
          },
          create: {
            id: `${cityId}-${this.generateBusinessKey(business)}`,
            name: business.name,
            address: business.address,
            postalCode: business.postalCode,
            cityId,
            phone: business.phone,
            website: business.website,
            rating: business.rating,
            reviewCount: business.reviewCount,
            latitude: business.latitude,
            longitude: business.longitude,
            services: servicesString,
            openingHours: openingHoursString,
            scraped: true,
          },
        })
        saved++
      } catch (error) {
        console.error(`  ❌ Erreur sauvegarde ${business.name}:`, error)
      }
    }

    return saved
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async cleanup() {
    if (this.googleMapsScraper) {
      await this.googleMapsScraper.close()
    }
    await prisma.$disconnect()
  }
}

// Exemple d'utilisation
if (require.main === module) {
  const orchestrator = new ScrapingOrchestrator({
    enableDataForSEO: true,  // Source principale (recommandé)
    enableGoogleMaps: false,  // Désactivé car DataForSEO fait déjà Google
    enablePagesJaunes: false, // Peut causer des 403
    enableRGE: true,          // Complément pour entreprises certifiées
    batchSize: 10,            // Traiter 10 villes
    delayBetweenCities: 5000, // 5 secondes entre chaque ville
  })

  orchestrator
    .init()
    .then(() => orchestrator.scrapeCities())
    .then(() => {
      console.log('\n✅ Scraping terminé!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error)
      process.exit(1)
    })
}
