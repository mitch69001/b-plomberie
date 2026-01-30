/**
 * Scraper pour l'annuaire des entreprises RGE (Reconnu Garant de l'Environnement)
 * Source: https://france-renov.gouv.fr/annuaire-rge
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { BusinessData } from './google-maps'

export class RGEScraper {
  private baseUrl = 'https://france-renov.gouv.fr'

  async scrapeCity(cityName: string, postalCode: string): Promise<BusinessData[]> {
    console.log(`\n🏅 Scraping annuaire RGE pour ${cityName} (${postalCode})...`)
    
    const businesses: BusinessData[] = []

    try {
      // Note: L'API/URL exacte peut varier. Voici une approche générique.
      // Il faudra adapter selon la structure réelle de l'API France Rénov
      
      const searchUrl = `${this.baseUrl}/annuaire-rge/resultat`
      
      const response = await axios.get(searchUrl, {
        params: {
          code_postal: postalCode,
          rayon: 20, // Rayon de recherche en km
          activite: 'installation-equipements-solaires',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      })

      const $ = cheerio.load(response.data)

      // Parser les résultats (structure à adapter selon le site réel)
      $('.entreprise-item, [data-type="entreprise"]').each((_, element) => {
        try {
          const $el = $(element)
          
          const name = $el.find('.entreprise-nom, h3, .nom').text().trim()
          const address = $el.find('.entreprise-adresse, .adresse').text().trim()
          const phone = $el.find('.entreprise-tel, .telephone').text().trim().replace(/\s/g, '')
          const website = $el.find('a[href*="http"]').attr('href')
          
          // Extraire le code postal de l'adresse si présent
          const postalMatch = address.match(/\b(\d{5})\b/)
          const extractedPostal = postalMatch ? postalMatch[1] : postalCode

          if (name && address) {
            businesses.push({
              name,
              address,
              city: cityName,
              postalCode: extractedPostal,
              phone: phone || undefined,
              website: website || undefined,
              services: ['Installation solaire RGE'],
            })
          }
        } catch (err) {
          // Ignore parsing errors
        }
      })

      console.log(`   ✅ ${businesses.length} entreprises RGE trouvées`)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(`   ℹ️  Pas de résultats RGE pour cette ville`)
        } else {
          console.error(`   ❌ Erreur HTTP: ${error.response?.status}`)
        }
      } else {
        console.error(`   ❌ Erreur: ${error}`)
      }
    }

    return businesses
  }

  /**
   * Méthode alternative utilisant l'API JSON si disponible
   */
  async scrapeCityAPI(cityName: string, postalCode: string): Promise<BusinessData[]> {
    try {
      // Exemple d'appel API (à adapter selon l'API réelle)
      const response = await axios.post(
        `${this.baseUrl}/api/annuaire/search`,
        {
          code_postal: postalCode,
          activite: 'solaire',
          rayon: 20,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 15000,
        }
      )

      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results.map((item: any) => ({
          name: item.nom || item.raison_sociale,
          address: item.adresse,
          city: item.ville || cityName,
          postalCode: item.code_postal || postalCode,
          phone: item.telephone,
          website: item.site_web,
          services: ['Installation solaire RGE'],
        }))
      }
    } catch (error) {
      console.log('   ℹ️  API non disponible, utilisation du scraping HTML')
    }

    return []
  }
}
