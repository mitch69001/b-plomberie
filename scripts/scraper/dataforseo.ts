/**
 * Scraper DataForSEO pour les installateurs de panneaux solaires
 * API SERP Google Maps de DataForSEO
 * Documentation: https://docs.dataforseo.com/v3/serp/google/maps/live/advanced
 */

import axios from 'axios'

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
  openingHours?: any
}

interface DataForSEOConfig {
  login: string
  password: string
}

export class DataForSEOScraper {
  private config: DataForSEOConfig
  private apiUrl = 'https://api.dataforseo.com/v3/serp/google/maps/live/advanced'

  constructor(config: DataForSEOConfig) {
    this.config = config
  }

  /**
   * Scrape les entreprises pour une ville via DataForSEO SERP Google Maps
   */
  async scrapeCity(
    cityName: string,
    postalCode: string,
    latitude: number,
    longitude: number | null
  ): Promise<BusinessData[]> {
    console.log(`\n🔍 DataForSEO: Scraping pour ${cityName} (${postalCode})...`)
    
    // Mot-clé de recherche : "installateur panneaux solaires" + ville
    const keyword = `installateur panneaux solaires ${cityName}`
    console.log(`   Mot-clé: "${keyword}"`)

    try {
      const results = await this.searchGoogleMaps(keyword, latitude, longitude)
      console.log(`   ✅ ${results.length} entreprises trouvées`)
      return results
    } catch (error: any) {
      console.error(`   ❌ Erreur: ${error.message}`)
      return []
    }
  }

  /**
   * Scrape les entreprises avec un mot-clé personnalisé
   */
  async scrapeWithCustomKeyword(
    cityName: string,
    postalCode: string,
    latitude: number,
    longitude: number,
    customKeyword: string
  ): Promise<BusinessData[]> {
    const keyword = `${customKeyword} ${cityName}`

    try {
      const results = await this.searchGoogleMaps(keyword, latitude, longitude)
      return results
    } catch (error: any) {
      console.error(`   ❌ Erreur: ${error.message}`)
      return []
    }
  }

  /**
   * Recherche via l'API SERP Google Maps (simule une vraie recherche Google Maps)
   */
  private async searchGoogleMaps(
    keyword: string,
    latitude: number,
    longitude: number | null
  ): Promise<BusinessData[]> {
    // Paramètres de recherche SERP Google Maps
    const postData = [{
      keyword: keyword,
      location_coordinate: `${latitude},${longitude},15z`, // 15z = zoom level
      language_code: 'fr',
      device: 'desktop',
      depth: 10, // Récupérer les 10 premiers résultats
    }]

    try {
      const response = await axios.post(
        this.apiUrl,
        postData,
        {
          auth: {
            username: this.config.login,
            password: this.config.password,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.status_code !== 20000) {
        throw new Error(`API Error: ${response.data.status_message}`)
      }

      const items = response.data.tasks?.[0]?.result?.[0]?.items || []
      
      return items
        .filter((item: any) => item.type === 'maps_search')
        .map((item: any) => this.parseGoogleMapsItem(item))
        .filter((item: BusinessData | null) => item !== null) as BusinessData[]

    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.status_message || error.message
        throw new Error(`API Error ${error.response.status}: ${errorMsg}`)
      }
      throw error
    }
  }

  /**
   * Parse un élément Google Maps de DataForSEO SERP
   */
  private parseGoogleMapsItem(item: any): BusinessData | null {
    try {
      const title = item.title || ''
      const address = item.address || ''
      const postalCode = item.address_info?.zip || this.extractPostalCode(address)
      const city = item.address_info?.city || ''

      if (!title || !address) {
        return null
      }

      // Extraire les services depuis les catégories
      const services: string[] = []
      if (item.category) services.push(item.category)
      if (item.additional_categories && Array.isArray(item.additional_categories)) {
        services.push(...item.additional_categories)
      }

      return {
        name: title,
        address,
        postalCode: postalCode || '',
        city: city || '',
        phone: item.phone || undefined,
        website: item.domain || undefined,
        rating: item.rating?.value || undefined,
        reviewCount: item.rating?.votes_count || undefined,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        services: services.length > 0 ? services : undefined,
        openingHours: item.work_hours ? this.parseWorkHours(item.work_hours) : undefined,
      }
    } catch (error) {
      console.error('   ⚠️  Erreur de parsing:', error)
      return null
    }
  }

  /**
   * Extrait le code postal d'une adresse
   */
  private extractPostalCode(address: string): string | null {
    const match = address.match(/\b\d{5}\b/)
    return match ? match[0] : null
  }

  /**
   * Parse les horaires d'ouverture (format SERP Google Maps)
   */
  private parseWorkHours(workHours: any): any {
    if (!workHours || typeof workHours !== 'object') {
      return null
    }

    try {
      return {
        monday: workHours.timetable?.monday || [],
        tuesday: workHours.timetable?.tuesday || [],
        wednesday: workHours.timetable?.wednesday || [],
        thursday: workHours.timetable?.thursday || [],
        friday: workHours.timetable?.friday || [],
        saturday: workHours.timetable?.saturday || [],
        sunday: workHours.timetable?.sunday || [],
        current_status: workHours.current_status || null,
      }
    } catch {
      return null
    }
  }

  /**
   * Délai d'attente
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Vérifie les crédits disponibles
   */
  async checkCredits(): Promise<number> {
    try {
      const response = await axios.get(
        'https://api.dataforseo.com/v3/appendix/user_data',
        {
          auth: {
            username: this.config.login,
            password: this.config.password,
          },
        }
      )

      const balance = response.data.tasks?.[0]?.result?.money?.balance || 0
      console.log(`💰 Crédits DataForSEO: $${balance.toFixed(2)}`)
      return balance
    } catch (error: any) {
      console.error('❌ Erreur vérification crédits:', error.message)
      return 0
    }
  }
}
