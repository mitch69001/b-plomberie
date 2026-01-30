/**
 * Script pour ajouter les régions et départements des 50 plus grandes villes de France
 * Ce script s'assure que chaque grande ville a sa région et son département dans les tables dédiées
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

// Mapping des codes régions vers les noms de régions
const REGION_CODES: Record<string, string> = {
  '84': 'Auvergne-Rhône-Alpes',
  '27': 'Bourgogne-Franche-Comté',
  '53': 'Bretagne',
  '24': 'Centre-Val de Loire',
  '94': 'Corse',
  '44': 'Grand Est',
  '32': 'Hauts-de-France',
  '11': 'Île-de-France',
  '28': 'Normandie',
  '75': 'Nouvelle-Aquitaine',
  '76': 'Occitanie',
  '52': 'Pays de la Loire',
  "93": "Provence-Alpes-Côte d'Azur",
  '01': 'Guadeloupe',
  '02': 'Martinique',
  '03': 'Guyane',
  '04': 'La Réunion',
  '06': 'Mayotte'
}

// Mapping des codes départements vers les noms
const DEPARTMENT_CODES: Record<string, { name: string; regionCode: string }> = {
  '75': { name: 'Paris', regionCode: '11' },
  '13': { name: 'Bouches-du-Rhône', regionCode: '93' },
  '69': { name: 'Rhône', regionCode: '84' },
  '31': { name: 'Haute-Garonne', regionCode: '76' },
  '06': { name: 'Alpes-Maritimes', regionCode: '93' },
  '44': { name: 'Loire-Atlantique', regionCode: '52' },
  '33': { name: 'Gironde', regionCode: '75' },
  '59': { name: 'Nord', regionCode: '32' },
  '67': { name: 'Bas-Rhin', regionCode: '44' },
  '34': { name: 'Hérault', regionCode: '76' },
  '92': { name: 'Hauts-de-Seine', regionCode: '11' },
  '93': { name: 'Seine-Saint-Denis', regionCode: '11' },
  '94': { name: 'Val-de-Marne', regionCode: '11' },
  '35': { name: 'Ille-et-Vilaine', regionCode: '53' },
  '38': { name: 'Isère', regionCode: '84' },
  '49': { name: 'Maine-et-Loire', regionCode: '52' },
  '54': { name: 'Meurthe-et-Moselle', regionCode: '44' },
  '62': { name: 'Pas-de-Calais', regionCode: '32' },
  '63': { name: 'Puy-de-Dôme', regionCode: '84' },
  '76': { name: 'Seine-Maritime', regionCode: '28' },
  '83': { name: 'Var', regionCode: '93' },
  '91': { name: 'Essonne', regionCode: '11' },
  '95': { name: 'Val-d\'Oise', regionCode: '11' },
  '14': { name: 'Calvados', regionCode: '28' },
  '21': { name: 'Côte-d\'Or', regionCode: '27' },
  '25': { name: 'Doubs', regionCode: '27' },
  '29': { name: 'Finistère', regionCode: '53' },
  '30': { name: 'Gard', regionCode: '76' },
  '37': { name: 'Indre-et-Loire', regionCode: '24' },
  '42': { name: 'Loire', regionCode: '84' },
  '45': { name: 'Loiret', regionCode: '24' },
  '51': { name: 'Marne', regionCode: '44' },
  '56': { name: 'Morbihan', regionCode: '53' },
  '57': { name: 'Moselle', regionCode: '44' },
  '64': { name: 'Pyrénées-Atlantiques', regionCode: '75' },
  '66': { name: 'Pyrénées-Orientales', regionCode: '76' },
  '68': { name: 'Haut-Rhin', regionCode: '44' },
  '72': { name: 'Sarthe', regionCode: '52' },
  '73': { name: 'Savoie', regionCode: '84' },
  '74': { name: 'Haute-Savoie', regionCode: '84' },
  '77': { name: 'Seine-et-Marne', regionCode: '11' },
  '78': { name: 'Yvelines', regionCode: '11' },
  '80': { name: 'Somme', regionCode: '32' },
  '84': { name: 'Vaucluse', regionCode: '93' },
  '85': { name: 'Vendée', regionCode: '52' },
  '86': { name: 'Vienne', regionCode: '75' },
  '87': { name: 'Haute-Vienne', regionCode: '75' },
  '971': { name: 'Guadeloupe', regionCode: '01' },
  '972': { name: 'Martinique', regionCode: '02' },
  '973': { name: 'Guyane', regionCode: '03' },
  '974': { name: 'La Réunion', regionCode: '04' },
  '976': { name: 'Mayotte', regionCode: '06' }
}

async function seedTopCitiesRegions() {
  console.log('🚀 Début du seed des régions et départements des 50 plus grandes villes...\n')
  
  try {
    // 1. Récupérer les 50 plus grandes villes de France par population
    console.log('📊 Récupération des 50 plus grandes villes...')
    const topCities = await prisma.city.findMany({
      where: {
        population: {
          not: null
        }
      },
      orderBy: {
        population: 'desc'
      },
      take: 50,
      select: {
        name: true,
        region: true,
        department: true,
        population: true
      }
    })

    console.log(`✅ ${topCities.length} villes récupérées\n`)
    
    // Afficher les 10 premières villes
    console.log('🏙️  Top 10 des plus grandes villes:')
    topCities.slice(0, 10).forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} (${city.population?.toLocaleString()} hab.) - ${city.department}, ${city.region}`)
    })
    console.log()

    // 2. Extraire les régions et départements uniques
    const uniqueRegions = new Map<string, string>()
    const uniqueDepartments = new Map<string, { name: string; region: string }>()

    topCities.forEach(city => {
      if (city.region) {
        uniqueRegions.set(city.region, city.region)
      }
      if (city.department && city.region) {
        uniqueDepartments.set(city.department, {
          name: city.department,
          region: city.region
        })
      }
    })

    console.log(`📍 ${uniqueRegions.size} régions uniques trouvées`)
    console.log(`📍 ${uniqueDepartments.size} départements uniques trouvés\n`)

    // 3. Ajouter les régions
    console.log('🌍 Ajout des régions...')
    let regionsAdded = 0
    let regionsExisting = 0

    for (const [regionName] of uniqueRegions) {
      const slug = slugify(regionName)
      
      const existing = await prisma.region.findUnique({
        where: { slug }
      })

      if (!existing) {
        await prisma.region.create({
          data: {
            name: regionName,
            slug,
            description: `Découvrez tous les installateurs de panneaux photovoltaïques en ${regionName}`,
            active: true
          }
        })
        console.log(`  ✅ Région ajoutée: ${regionName}`)
        regionsAdded++
      } else {
        regionsExisting++
      }
    }

    console.log(`\n📊 Régions: ${regionsAdded} ajoutées, ${regionsExisting} existantes\n`)

    // 4. Ajouter les départements
    console.log('🗺️  Ajout des départements...')
    let departmentsAdded = 0
    let departmentsExisting = 0

    for (const [deptName, info] of uniqueDepartments) {
      const slug = slugify(deptName)
      
      // Trouver la région correspondante
      const region = await prisma.region.findUnique({
        where: { slug: slugify(info.region) }
      })

      if (!region) {
        console.log(`  ⚠️  Région non trouvée pour ${deptName}: ${info.region}`)
        continue
      }

      const existing = await prisma.department.findUnique({
        where: { slug }
      })

      if (!existing) {
        // Trouver le code département si possible
        let deptCode: string | null = null
        for (const [code, data] of Object.entries(DEPARTMENT_CODES)) {
          if (data.name === deptName) {
            deptCode = code
            break
          }
        }

        await prisma.department.create({
          data: {
            name: deptName,
            slug,
            code: deptCode,
            regionId: region.id,
            active: true
          }
        })
        console.log(`  ✅ Département ajouté: ${deptName} (${info.region})`)
        departmentsAdded++
      } else {
        departmentsExisting++
      }
    }

    console.log(`\n📊 Départements: ${departmentsAdded} ajoutés, ${departmentsExisting} existants\n`)

    // 5. Afficher le résumé final
    console.log('=' .repeat(60))
    console.log('📊 RÉSUMÉ FINAL')
    console.log('='.repeat(60))
    console.log(`🏙️  Villes analysées: ${topCities.length}`)
    console.log(`🌍 Régions ajoutées: ${regionsAdded}`)
    console.log(`🗺️  Départements ajoutés: ${departmentsAdded}`)
    console.log('='.repeat(60))

    // 6. Afficher les statistiques
    const totalRegions = await prisma.region.count()
    const totalDepartments = await prisma.department.count()
    
    console.log('\n📈 Base de données:')
    console.log(`  - Total régions: ${totalRegions}`)
    console.log(`  - Total départements: ${totalDepartments}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
seedTopCitiesRegions()
  .then(() => {
    console.log('\n✅ Script terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
