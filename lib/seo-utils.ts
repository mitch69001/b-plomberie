/**
 * Utilitaires SEO
 */

/**
 * Génère un slug SEO-friendly à partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/['']/g, '-') // Remplacer les apostrophes
    .replace(/œ/g, 'oe') // Remplacer les caractères spéciaux
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, '') // Retirer les tirets en début/fin
    .replace(/--+/g, '-') // Remplacer les doubles tirets par un seul
}

/**
 * Tronque un texte à une longueur maximale tout en gardant les mots entiers
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

/**
 * Génère des métadonnées Open Graph optimisées
 */
export function generateOpenGraphMetadata(params: {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
}) {
  return {
    title: params.title,
    description: params.description,
    url: params.url,
    type: params.type || 'website',
    locale: 'fr_FR',
    siteName: 'Installateurs Panneaux Solaires',
    images: params.image ? [{ url: params.image }] : [],
  }
}

/**
 * Génère des métadonnées Twitter Card
 */
export function generateTwitterMetadata(params: {
  title: string
  description: string
  image?: string
}) {
  return {
    card: 'summary_large_image' as const,
    title: params.title,
    description: params.description,
    images: params.image ? [params.image] : [],
  }
}

/**
 * Génère un titre de page optimisé pour le SEO
 * Respecte les limites de longueur de Google (50-60 caractères)
 */
export function generateSEOTitle(parts: string[], separator = ' | '): string {
  const title = parts.join(separator)
  return truncate(title, 60)
}

/**
 * Génère une meta description optimisée
 * Respecte les limites de longueur de Google (150-160 caractères)
 */
export function generateMetaDescription(text: string): string {
  return truncate(text, 160)
}

/**
 * Valide et nettoie un numéro de téléphone français
 */
export function cleanPhoneNumber(phone: string): string {
  // Retirer tous les caractères non numériques sauf le +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Formats acceptés : 0123456789, +33123456789, 0033123456789
  if (cleaned.match(/^0[1-9]\d{8}$/)) {
    return cleaned
  }
  if (cleaned.match(/^\+33[1-9]\d{8}$/)) {
    return '0' + cleaned.substring(3)
  }
  if (cleaned.match(/^0033[1-9]\d{8}$/)) {
    return '0' + cleaned.substring(4)
  }
  
  return phone
}

/**
 * Génère un ID unique pour un business basé sur son nom et son adresse
 */
export function generateBusinessId(name: string, address: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanAddress = address.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
  return `${cleanName}-${cleanAddress}`
}

/**
 * Calcule le score de qualité d'un business
 */
export function calculateBusinessQualityScore(business: {
  name?: string
  address?: string
  phone?: string | null
  website?: string | null
  rating?: number | null
  reviewCount?: number | null
}): number {
  let score = 0
  
  if (business.name && business.name.length > 3) score += 20
  if (business.address && business.address.length > 10) score += 20
  if (business.phone) score += 15
  if (business.website) score += 15
  if (business.rating && business.rating >= 4) score += 20
  if (business.reviewCount && business.reviewCount >= 5) score += 10
  
  return Math.min(score, 100)
}

/**
 * Génère des mots-clés SEO pour une ville
 */
export function generateCityKeywords(city: {
  name: string
  postalCode: string
  department: string
  region: string
}): string[] {
  return [
    `panneaux solaires ${city.name}`,
    `photovoltaïque ${city.name}`,
    `installateur RGE ${city.name}`,
    `${city.postalCode}`,
    `installation solaire ${city.department}`,
    `devis panneaux solaires ${city.name}`,
    `prix panneaux solaires ${city.name}`,
    `énergie solaire ${city.region}`,
  ]
}
