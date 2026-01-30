/**
 * Script d'importation des villes françaises depuis l'API Geo.gouv.fr
 * API: https://geo.api.gouv.fr/communes
 * Import de ~36 000 communes avec coordonnées GPS
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ApiCity {
  nom: string
  code: string
  codeDepartement: string
  codeRegion: string
  codesPostaux: string[]
  population?: number | null
  centre?: {
    coordinates: [number, number]
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

async function fetchCities(): Promise<ApiCity[]> {
  console.log('🔍 Récupération des communes depuis l\'API Geo.gouv.fr...')
  
  const response = await fetch(
    'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,codeDepartement,codeRegion,population,centre&format=json&geometry=centre'
  )
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  console.log(`✅ ${data.length} communes récupérées`)
  
  return data
}

async function getRegionName(codeRegion: string): Promise<string> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/regions/${codeRegion}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.nom
    }
  } catch (error) {
    console.error(`Erreur région ${codeRegion}:`, error)
  }
  return codeRegion
}

async function getDepartmentName(codeDepartement: string): Promise<string> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/departements/${codeDepartement}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.nom
    }
  } catch (error) {
    console.error(`Erreur département ${codeDepartement}:`, error)
  }
  return codeDepartement
}

async function importCities() {
  console.log('🚀 Début de l\'importation des villes...\n')
  
  try {
    const cities = await fetchCities()
    
    // Cache pour les noms de régions et départements
    const regionCache = new Map<string, string>()
    const departmentCache = new Map<string, string>()
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    console.log('📥 Import dans la base de données...\n')
    
    for (const city of cities) {
      try {
        // Skip cities without coordinates
        if (!city.centre?.coordinates) {
          skipped++
          continue
        }
        
        const [longitude, latitude] = city.centre.coordinates
        const slug = slugify(city.nom)
        const postalCode = city.codesPostaux[0] || city.code
        
        // Get region name (with cache)
        if (!regionCache.has(city.codeRegion)) {
          const regionName = await getRegionName(city.codeRegion)
          regionCache.set(city.codeRegion, regionName)
        }
        const region = regionCache.get(city.codeRegion)!
        
        // Get department name (with cache)
        if (!departmentCache.has(city.codeDepartement)) {
          const deptName = await getDepartmentName(city.codeDepartement)
          departmentCache.set(city.codeDepartement, deptName)
        }
        const department = departmentCache.get(city.codeDepartement)!
        
        await prisma.city.upsert({
          where: { slug },
          update: {
            name: city.nom,
            postalCode,
            department,
            region,
            population: city.population || null,
            latitude,
            longitude,
          },
          create: {
            name: city.nom,
            slug,
            postalCode,
            department,
            region,
            population: city.population || null,
            latitude,
            longitude,
          },
        })
        
        imported++
        
        // Progress indicator
        if (imported % 1000 === 0) {
          console.log(`✅ ${imported} villes importées...`)
        }
      } catch (error) {
        errors++
        console.error(`❌ Erreur pour ${city.nom}:`, error)
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 Résumé de l\'importation:')
    console.log('='.repeat(50))
    console.log(`✅ Villes importées: ${imported}`)
    console.log(`⏭️  Villes ignorées: ${skipped}`)
    console.log(`❌ Erreurs: ${errors}`)
    console.log('='.repeat(50) + '\n')
    
    // Afficher quelques statistiques
    const stats = await prisma.city.groupBy({
      by: ['region'],
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          _all: 'desc',
        },
      },
      take: 5,
    })
    
    console.log('📍 Top 5 régions par nombre de communes:')
    stats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.region}: ${stat._count._all} communes`)
    })
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute
importCities()
  .then(() => {
    console.log('\n✅ Import terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
