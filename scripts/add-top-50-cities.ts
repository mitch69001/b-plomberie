/**
 * Script pour ajouter les 50 plus grandes villes de France
 * Utilise l'API Geo.gouv.fr pour récupérer les données complètes
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ApiCity {
  nom: string
  code: string
  codeDepartement: string
  codeRegion: string
  codesPostaux: string[]
  population?: number
  centre?: {
    coordinates: [number, number]
  }
}

interface ApiRegion {
  code: string
  nom: string
}

interface ApiDepartment {
  code: string
  nom: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

async function fetchTopCities(limit: number = 50): Promise<ApiCity[]> {
  console.log(`🔍 Récupération des ${limit} plus grandes villes depuis l'API Geo.gouv.fr...`)
  
  const response = await fetch(
    'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,codeDepartement,codeRegion,population,centre&format=json&geometry=centre'
  )
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
  }
  
  const data: ApiCity[] = await response.json()
  
  // Filtrer les villes avec population et coordonnées, puis trier par population
  const citiesWithPopulation = data
    .filter(city => city.population && city.centre?.coordinates)
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit)
  
  console.log(`✅ ${citiesWithPopulation.length} villes récupérées`)
  
  return citiesWithPopulation
}

async function getRegionName(codeRegion: string): Promise<string> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/regions/${codeRegion}`
    )
    if (response.ok) {
      const data: ApiRegion = await response.json()
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
      const data: ApiDepartment = await response.json()
      return data.nom
    }
  } catch (error) {
    console.error(`Erreur département ${codeDepartement}:`, error)
  }
  return codeDepartement
}

async function addTop50Cities() {
  console.log('🚀 Début de l\'ajout des 50 plus grandes villes de France...\n')
  
  try {
    // 1. Récupérer les 50 plus grandes villes
    const topCities = await fetchTopCities(50)
    
    console.log('\n🏙️  Top 20 des plus grandes villes:')
    topCities.slice(0, 20).forEach((city, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${city.nom.padEnd(20, ' ')} - ${city.population?.toLocaleString().padStart(10, ' ')} hab.`)
    })
    console.log()
    
    // Cache pour les noms de régions et départements
    const regionCache = new Map<string, string>()
    const departmentCache = new Map<string, string>()
    
    // Collections pour suivre les régions et départements à créer
    const regionsToCreate = new Map<string, string>() // slug -> nom
    const departmentsToCreate = new Map<string, { name: string; code: string; regionSlug: string }>()
    
    let citiesAdded = 0
    let citiesUpdated = 0
    let citiesSkipped = 0
    
    console.log('📥 Import des villes dans la base de données...\n')
    
    for (const city of topCities) {
      try {
        if (!city.centre?.coordinates) {
          citiesSkipped++
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
        const regionSlug = slugify(region)
        
        // Get department name (with cache)
        if (!departmentCache.has(city.codeDepartement)) {
          const deptName = await getDepartmentName(city.codeDepartement)
          departmentCache.set(city.codeDepartement, deptName)
        }
        const department = departmentCache.get(city.codeDepartement)!
        
        // Ajouter aux collections pour création ultérieure
        regionsToCreate.set(regionSlug, region)
        departmentsToCreate.set(slugify(department), {
          name: department,
          code: city.codeDepartement,
          regionSlug: regionSlug
        })
        
        // Vérifier si la ville existe déjà
        const existingCity = await prisma.city.findUnique({
          where: { slug }
        })
        
        const cityData = {
          name: city.nom,
          postalCode,
          department,
          region,
          population: city.population || null,
          latitude,
          longitude,
        }
        
        if (existingCity) {
          await prisma.city.update({
            where: { slug },
            data: cityData
          })
          citiesUpdated++
          console.log(`  ♻️  Ville mise à jour: ${city.nom} (${city.population?.toLocaleString()} hab.)`)
        } else {
          await prisma.city.create({
            data: {
              ...cityData,
              slug,
            }
          })
          citiesAdded++
          console.log(`  ✅ Ville ajoutée: ${city.nom} (${city.population?.toLocaleString()} hab.)`)
        }
        
      } catch (error) {
        console.error(`❌ Erreur pour ${city.nom}:`, error)
        citiesSkipped++
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Résumé des villes:')
    console.log('='.repeat(60))
    console.log(`✅ Villes ajoutées: ${citiesAdded}`)
    console.log(`♻️  Villes mises à jour: ${citiesUpdated}`)
    console.log(`⏭️  Villes ignorées: ${citiesSkipped}`)
    console.log('='.repeat(60))
    
    // 2. Créer les régions et départements
    console.log('\n🌍 Ajout des régions...')
    let regionsAdded = 0
    
    for (const [slug, name] of regionsToCreate) {
      const existing = await prisma.region.findUnique({
        where: { slug }
      })
      
      if (!existing) {
        await prisma.region.create({
          data: {
            name,
            slug,
            description: `Découvrez tous les installateurs de panneaux photovoltaïques en ${name}`,
            active: true
          }
        })
        console.log(`  ✅ Région ajoutée: ${name}`)
        regionsAdded++
      }
    }
    
    console.log(`\n📊 ${regionsAdded} région(s) ajoutée(s)`)
    
    console.log('\n🗺️  Ajout des départements...')
    let departmentsAdded = 0
    
    for (const [slug, data] of departmentsToCreate) {
      const region = await prisma.region.findUnique({
        where: { slug: data.regionSlug }
      })
      
      if (!region) {
        console.log(`  ⚠️  Région non trouvée pour ${data.name}: ${data.regionSlug}`)
        continue
      }
      
      const existing = await prisma.department.findUnique({
        where: { slug }
      })
      
      if (!existing) {
        await prisma.department.create({
          data: {
            name: data.name,
            slug,
            code: data.code,
            regionId: region.id,
            active: true
          }
        })
        console.log(`  ✅ Département ajouté: ${data.name} (${data.code})`)
        departmentsAdded++
      }
    }
    
    console.log(`\n📊 ${departmentsAdded} département(s) ajouté(s)`)
    
    // 3. Statistiques finales
    const totalCities = await prisma.city.count()
    const totalRegions = await prisma.region.count()
    const totalDepartments = await prisma.department.count()
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 STATISTIQUES FINALES')
    console.log('='.repeat(60))
    console.log(`🏙️  Total villes: ${totalCities}`)
    console.log(`🌍 Total régions: ${totalRegions}`)
    console.log(`🗺️  Total départements: ${totalDepartments}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
addTop50Cities()
  .then(() => {
    console.log('\n✅ Script terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
