/**
 * Scraper Pages Jaunes pour les installateurs de panneaux solaires
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { BusinessData } from './google-maps'

export class PagesJaunesScraper {
  private baseUrl = 'https://www.pagesjaunes.fr'
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  async scrapeCity(cityName: string, postalCode: string): Promise<BusinessData[]> {
    console.log(`\n📒 Scraping Pages Jaunes pour ${cityName} (${postalCode})...`)
    
    const businesses: BusinessData[] = []
    const queries = [
      'installateur panneaux solaires',
      'photovoltaique',
      'energie solaire',
    ]

    for (const query of queries) {
      console.log(`   Recherche: "${query}"`)

      try {
        const searchUrl = `${this.baseUrl}/recherche/${encodeURIComponent(query)}/${encodeURIComponent(cityName)}-${postalCode}`
        
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9',
          },
          timeout: 15000,
        })

        const $ = cheerio.load(response.data)
        const results: BusinessData[] = []

        // Parser les résultats (structure peut varier)
        $('.bi-list .bi-item').each((_, element) => {
          try {
            const $el = $(element)
            
            const name = $el.find('.bi-denomination').text().trim()
            const address = $el.find('.bi-address').text().trim()
            const phone = $el.find('.bi-phone').text().trim().replace(/\s/g, '')
            const website = $el.find('a[href*="site-web"]').attr('href')

            if (name && address) {
              results.push({
                name,
                address,
                city: cityName,
                postalCode,
                phone: phone || undefined,
                website: website || undefined,
                services: [query],
              })
            }
          } catch (err) {
            // Ignore parsing errors
          }
        })

        // Alternative: autre structure HTML
        if (results.length === 0) {
          $('article[itemtype*="LocalBusiness"], .item-entreprise').each((_, element) => {
            try {
              const $el = $(element)
              
              const name = $el.find('[itemprop="name"], .denomination-links').text().trim()
              const address = $el.find('[itemprop="streetAddress"], .adresse').text().trim()
              const phone = $el.find('[itemprop="telephone"], .numTel').text().trim().replace(/\s/g, '')
              
              if (name && address) {
                results.push({
                  name,
                  address,
                  city: cityName,
                  postalCode,
                  phone: phone || undefined,
                  services: [query],
                })
              }
            } catch (err) {
              // Ignore
            }
          })
        }

        // Ajouter les résultats uniques
        results.forEach((result) => {
          if (!businesses.find((b) => b.name === result.name)) {
            businesses.push(result)
          }
        })

        console.log(`   ✅ ${results.length} entreprises trouvées`)
        
        // Rate limiting
        await this.delay(3000)

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`   ❌ Erreur HTTP: ${error.response?.status}`)
        } else {
          console.error(`   ❌ Erreur: ${error}`)
        }
      }
    }

    console.log(`   📊 Total: ${businesses.length} entreprises uniques`)
    return businesses
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
