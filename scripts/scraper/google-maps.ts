/**
 * Scraper Google Maps pour les installateurs de panneaux solaires
 */

import puppeteer, { Browser, Page } from 'puppeteer'

export interface BusinessData {
  name: string
  address: string
  postalCode: string
  city: string
  phone?: string | null
  website?: string | null
  rating?: number | null
  reviewCount?: number | null
  latitude?: number
  longitude?: number
  services?: string[]
}

const SEARCH_QUERIES = [
  'installateur panneaux solaires',
  'photovoltaïque',
  'entreprise panneau photovoltaique',
  'installateur solaire',
]

export class GoogleMapsScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  async init() {
    console.log('🌐 Initialisation du navigateur...')
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
  }

  async scrapeCity(cityName: string, postalCode: string): Promise<BusinessData[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.')
    }

    console.log(`\n🔍 Scraping Google Maps pour ${cityName} (${postalCode})...`)
    
    const businesses: BusinessData[] = []

    for (const query of SEARCH_QUERIES) {
      const searchQuery = `${query} ${cityName} ${postalCode}`
      console.log(`   Recherche: "${searchQuery}"`)

      try {
        await this.page.goto(
          `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`,
          { waitUntil: 'domcontentloaded', timeout: 60000 }
        )
        
        // Attendre que la page soit stable
        await this.delay(5000)

        // Attendre le chargement des résultats avec plusieurs sélecteurs possibles
        try {
          await this.page.waitForSelector('div[role="feed"]', { timeout: 5000 })
        } catch {
          try {
            await this.page.waitForSelector('[role="main"]', { timeout: 5000 })
          } catch {
            await this.page.waitForSelector('div[jsaction]', { timeout: 5000 })
          }
        }
        await this.delay(3000)

        // Scroll pour charger plus de résultats
        await this.scrollResults()

        // Extraire les données
        const results = await this.page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('div[role="feed"] > div'))
          const data: any[] = []

          items.forEach((item) => {
            try {
              const nameEl = item.querySelector('a[aria-label]')
              const name = nameEl?.getAttribute('aria-label') || ''
              
              if (!name || name.length < 3) return

              const addressEl = item.querySelector('div[style*="color"]')
              const address = addressEl?.textContent || ''

              const ratingEl = item.querySelector('span[role="img"]')
              const ratingText = ratingEl?.getAttribute('aria-label') || ''
              const ratingMatch = ratingText.match(/(\d+[,.]?\d*) étoiles?/)
              const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : undefined

              const reviewMatch = ratingText.match(/(\d+)\s+avis/)
              const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : undefined

              data.push({
                name,
                address,
                rating,
                reviewCount,
              })
            } catch (err) {
              // Ignore parsing errors
            }
          })

          return data
        })

        // Ajouter les résultats uniques
        results.forEach((result) => {
          if (!businesses.find((b) => b.name === result.name)) {
            businesses.push({
              ...result,
              city: cityName,
              postalCode,
              services: [query],
            })
          }
        })

        console.log(`   ✅ ${results.length} entreprises trouvées`)
        await this.delay(2000) // Rate limiting

      } catch (error) {
        console.error(`   ❌ Erreur: ${error}`)
      }
    }

    console.log(`   📊 Total: ${businesses.length} entreprises uniques`)
    return businesses
  }

  private async scrollResults() {
    if (!this.page) return

    try {
      const feed = await this.page.$('div[role="feed"]')
      if (feed) {
        for (let i = 0; i < 3; i++) {
          await this.page.evaluate((el) => {
            el?.scrollBy(0, 1000)
          }, feed)
          await this.delay(1000)
        }
      }
    } catch (error) {
      console.log('   Scroll failed, continuing...')
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      console.log('🔒 Navigateur fermé')
    }
  }
}
