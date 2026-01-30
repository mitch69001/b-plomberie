/**
 * Algorithme de maillage interne intelligent
 * Basé sur la proximité géographique et les critères de pertinence
 */

import { prisma } from './prisma'

interface City {
  id: string
  name: string
  slug: string
  postalCode: string
  department: string
  region: string
  latitude: number | null
  longitude: number | null
  population?: number | null
}

interface RelatedCity {
  city: City
  reason: string
  distance?: number
}

/**
 * Récupère les villes liées pour le maillage interne
 */
export async function getRelatedCities(cityId: string, limit = 10): Promise<RelatedCity[]> {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
  })

  if (!city) {
    return []
  }

  const relatedCities: RelatedCity[] = []

  // 1. Villes proches géographiquement
  // Pour SQLite, on récupère toutes les villes dans un rayon approximatif et on calcule la distance en JS
  const allCities = await prisma.city.findMany({
    where: {
      id: {
        not: cityId,
      },
      // Filtre approximatif par latitude/longitude (environ 100km)
      latitude: {
        gte: city.latitude - 1,
        lte: city.latitude + 1,
      },
      longitude: {
        gte: city.longitude - 1,
        lte: city.longitude + 1,
      },
    },
    take: 50,
  })

  // Calculer la distance et trier
  const citiesWithDistance = allCities.map(c => ({
    city: c,
    distance: calculateDistance(city.latitude, city.longitude, c.latitude, c.longitude),
  }))
  
  const nearbyCities = citiesWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)

  nearbyCities.forEach(({ city: nearbyCity, distance }) => {
    relatedCities.push({
      city: nearbyCity,
      reason: 'Ville à proximité',
      distance: Math.round(distance),
    })
  })

  // 2. Villes du même département (si pas déjà incluses)
  const departmentCities = await prisma.city.findMany({
    where: {
      department: city.department,
      id: {
        notIn: [cityId, ...relatedCities.map((rc) => rc.city.id)],
      },
    },
    orderBy: {
      population: 'desc',
    },
    take: 3,
  })

  departmentCities.forEach((deptCity) => {
    relatedCities.push({
      city: deptCity,
      reason: `Autre ville du ${city.department}`,
    })
  })

  // 3. Villes de taille similaire dans la région (±20% population)
  if (city.population) {
    const minPop = city.population * 0.8
    const maxPop = city.population * 1.2

    const similarCities = await prisma.city.findMany({
      where: {
        region: city.region,
        population: {
          gte: minPop,
          lte: maxPop,
        },
        id: {
          notIn: [cityId, ...relatedCities.map((rc) => rc.city.id)],
        },
      },
      orderBy: {
        population: 'desc',
      },
      take: 2,
    })

    similarCities.forEach((simCity) => {
      relatedCities.push({
        city: simCity,
        reason: 'Ville de taille similaire',
      })
    })
  }

  return relatedCities.slice(0, limit)
}

/**
 * Récupère les villes principales d'un département pour la navigation
 */
export async function getDepartmentCities(department: string, limit = 10): Promise<City[]> {
  return await prisma.city.findMany({
    where: { department },
    orderBy: {
      population: 'desc',
    },
    take: limit,
  })
}

/**
 * Récupère les départements d'une région pour la navigation
 */
export async function getRegionDepartments(region: string) {
  const cities = await prisma.city.findMany({
    where: { region },
    select: {
      department: true,
    },
    distinct: ['department'],
    orderBy: {
      department: 'asc',
    },
  })

  return cities.map((c) => c.department)
}

/**
 * Calcule la distance entre deux points GPS (en km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}
