import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Les 15 plus grandes villes de France (hors celles déjà présentes)
const topCities = [
  {
    name: 'Nantes',
    postalCode: '44000',
    department: 'Loire-Atlantique',
    region: 'Pays de la Loire',
    population: 320732,
    latitude: 47.218371,
    longitude: -1.553621
  },
  {
    name: 'Strasbourg',
    postalCode: '67000',
    department: 'Bas-Rhin',
    region: 'Grand Est',
    population: 291313,
    latitude: 48.573405,
    longitude: 7.752111
  },
  {
    name: 'Montpellier',
    postalCode: '34000',
    department: 'Hérault',
    region: 'Occitanie',
    population: 299096,
    latitude: 43.610769,
    longitude: 3.876716
  },
  {
    name: 'Lille',
    postalCode: '59000',
    department: 'Nord',
    region: 'Hauts-de-France',
    population: 236234,
    latitude: 50.62925,
    longitude: 3.057256
  },
  {
    name: 'Rennes',
    postalCode: '35000',
    department: 'Ille-et-Vilaine',
    region: 'Bretagne',
    population: 221272,
    latitude: 48.117266,
    longitude: -1.677793
  },
  {
    name: 'Reims',
    postalCode: '51100',
    department: 'Marne',
    region: 'Grand Est',
    population: 182460,
    latitude: 49.258329,
    longitude: 4.031696
  },
  {
    name: 'Saint-Étienne',
    postalCode: '42000',
    department: 'Loire',
    region: 'Auvergne-Rhône-Alpes',
    population: 175318,
    latitude: 45.439695,
    longitude: 4.387178
  },
  {
    name: 'Le Havre',
    postalCode: '76600',
    department: 'Seine-Maritime',
    region: 'Normandie',
    population: 170147,
    latitude: 49.49437,
    longitude: 0.107929
  },
  {
    name: 'Toulon',
    postalCode: '83000',
    department: 'Var',
    region: 'Provence-Alpes-Côte d\'Azur',
    population: 176198,
    latitude: 43.124228,
    longitude: 5.928,
  },
  {
    name: 'Grenoble',
    postalCode: '38000',
    department: 'Isère',
    region: 'Auvergne-Rhône-Alpes',
    population: 158454,
    latitude: 45.188529,
    longitude: 5.724524
  },
  {
    name: 'Dijon',
    postalCode: '21000',
    department: 'Côte-d\'Or',
    region: 'Bourgogne-Franche-Comté',
    population: 159346,
    latitude: 47.322047,
    longitude: 5.04148
  },
  {
    name: 'Angers',
    postalCode: '49000',
    department: 'Maine-et-Loire',
    region: 'Pays de la Loire',
    population: 155850,
    latitude: 47.478419,
    longitude: -0.563166
  },
  {
    name: 'Nîmes',
    postalCode: '30000',
    department: 'Gard',
    region: 'Occitanie',
    population: 151001,
    latitude: 43.836699,
    longitude: 4.360054
  },
  {
    name: 'Villeurbanne',
    postalCode: '69100',
    department: 'Rhône',
    region: 'Auvergne-Rhône-Alpes',
    population: 149019,
    latitude: 45.766944,
    longitude: 4.880278
  },
  {
    name: 'Clermont-Ferrand',
    postalCode: '63000',
    department: 'Puy-de-Dôme',
    region: 'Auvergne-Rhône-Alpes',
    population: 147284,
    latitude: 45.777222,
    longitude: 3.087025
  }
]

async function addTopCities() {
  console.log('🏙️  Ajout des 15 plus grandes villes de France...\n')

  let regionsCreated = 0
  let departmentsCreated = 0
  let citiesCreated = 0
  let citiesSkipped = 0

  for (const cityData of topCities) {
    console.log(`\n📍 Traitement de ${cityData.name}...`)

    // 1. Vérifier si la ville existe déjà
    const existingCity = await prisma.city.findUnique({
      where: { slug: slugify(cityData.name) }
    })

    if (existingCity) {
      console.log(`   ⏭️  Ville déjà existante, ignorée`)
      citiesSkipped++
      continue
    }

    // 2. Créer ou récupérer la région
    let region = await prisma.region.findUnique({
      where: { slug: slugify(cityData.region) }
    })

    if (!region) {
      region = await prisma.region.create({
        data: {
          name: cityData.region,
          slug: slugify(cityData.region),
          description: `Région ${cityData.region}`,
          active: true
        }
      })
      console.log(`   ✅ Région créée: ${cityData.region}`)
      regionsCreated++
    } else {
      console.log(`   ✓ Région existante: ${cityData.region}`)
    }

    // 3. Créer ou récupérer le département
    let department = await prisma.department.findUnique({
      where: { slug: slugify(cityData.department) }
    })

    if (!department) {
      // Extraire le code département du code postal
      const code = cityData.postalCode.substring(0, 2)
      
      department = await prisma.department.create({
        data: {
          name: cityData.department,
          slug: slugify(cityData.department),
          code: code,
          regionId: region.id,
          active: true
        }
      })
      console.log(`   ✅ Département créé: ${cityData.department} (${code})`)
      departmentsCreated++
    } else {
      console.log(`   ✓ Département existant: ${cityData.department}`)
    }

    // 4. Créer la ville
    const city = await prisma.city.create({
      data: {
        name: cityData.name,
        slug: slugify(cityData.name),
        postalCode: cityData.postalCode,
        department: cityData.department,
        region: cityData.region,
        population: cityData.population,
        latitude: cityData.latitude,
        longitude: cityData.longitude
      }
    })

    console.log(`   ✅ Ville créée: ${cityData.name} (${cityData.population.toLocaleString()} habitants)`)
    citiesCreated++
  }

  // Résumé final
  console.log('\n' + '='.repeat(60))
  console.log('✅ Opération terminée!\n')
  console.log('📊 Résumé:')
  console.log(`   • Régions créées: ${regionsCreated}`)
  console.log(`   • Départements créés: ${departmentsCreated}`)
  console.log(`   • Villes créées: ${citiesCreated}`)
  console.log(`   • Villes ignorées (déjà existantes): ${citiesSkipped}`)

  // Statistiques globales
  const totalRegions = await prisma.region.count()
  const totalDepartments = await prisma.department.count()
  const totalCities = await prisma.city.count()

  console.log('\n📋 Total dans la base de données:')
  console.log(`   • Régions: ${totalRegions}`)
  console.log(`   • Départements: ${totalDepartments}`)
  console.log(`   • Villes: ${totalCities}`)

  await prisma.$disconnect()
}

addTopCities()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
