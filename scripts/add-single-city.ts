import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CommuneAPI {
  nom: string
  code: string
  codeDepartement: string
  codeRegion: string
  codesPostaux: string[]
  population: number
  centre: {
    coordinates: [number, number]
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

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
  '93': "Provence-Alpes-Côte d'Azur",
  '01': 'Guadeloupe',
  '02': 'Martinique',
  '03': 'Guyane',
  '04': 'La Réunion',
  '06': 'Mayotte'
}

const DEPARTMENT_CODES: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': "Côte-d'Or",
  '22': "Côtes-d'Armor", '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
  '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
  '2A': 'Corse-du-Sud', '2B': 'Haute-Corse', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': "Val-d'Oise", '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte'
}

async function addCity(cityName: string) {
  console.log(`\n🔍 Recherche de "${cityName}" dans l'API Geo.gouv.fr...\n`)

  try {
    // Rechercher la commune
    const searchResponse = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=nom,code,codeDepartement,codeRegion,codesPostaux,population,centre&format=json&geometry=centre`
    )

    if (!searchResponse.ok) {
      throw new Error(`Erreur API: ${searchResponse.status}`)
    }

    const communes: CommuneAPI[] = await searchResponse.json()

    if (communes.length === 0) {
      throw new Error(`Aucune commune trouvée pour "${cityName}"`)
    }

    // Prendre la première commune (ou afficher les options si plusieurs)
    const commune = communes[0]

    console.log(`✅ Commune trouvée:`)
    console.log(`   Nom: ${commune.nom}`)
    console.log(`   Code: ${commune.code}`)
    console.log(`   Population: ${commune.population?.toLocaleString() || 'N/A'}`)
    console.log(`   Code postal: ${commune.codesPostaux[0]}`)
    console.log(`   Département: ${DEPARTMENT_CODES[commune.codeDepartement]} (${commune.codeDepartement})`)
    console.log(`   Région: ${REGION_CODES[commune.codeRegion]}`)
    console.log(`   Coordonnées: ${commune.centre.coordinates[1]}, ${commune.centre.coordinates[0]}`)

    const regionName = REGION_CODES[commune.codeRegion]
    const departmentName = DEPARTMENT_CODES[commune.codeDepartement]

    if (!regionName || !departmentName) {
      throw new Error(`Région ou département non trouvé dans les mappings`)
    }

    // Créer ou récupérer la région
    console.log(`\n📍 Gestion de la région...`)
    const region = await prisma.region.upsert({
      where: { slug: slugify(regionName) },
      update: {},
      create: {
        name: regionName,
        slug: slugify(regionName),
        active: true
      }
    })
    console.log(`   ✅ Région: ${region.name}`)

    // Créer ou récupérer le département
    console.log(`\n📍 Gestion du département...`)
    const department = await prisma.department.upsert({
      where: { slug: slugify(departmentName) },
      update: {},
      create: {
        name: departmentName,
        slug: slugify(departmentName),
        code: commune.codeDepartement,
        regionId: region.id,
        active: true
      }
    })
    console.log(`   ✅ Département: ${department.name}`)

    // Créer ou mettre à jour la ville
    console.log(`\n🏙️  Ajout de la ville...`)
    const city = await prisma.city.upsert({
      where: { slug: slugify(commune.nom) },
      update: {
        name: commune.nom,
        postalCode: commune.codesPostaux[0],
        department: departmentName,
        region: regionName,
        population: commune.population,
        latitude: commune.centre.coordinates[1],
        longitude: commune.centre.coordinates[0]
      },
      create: {
        name: commune.nom,
        slug: slugify(commune.nom),
        postalCode: commune.codesPostaux[0],
        department: departmentName,
        region: regionName,
        population: commune.population,
        latitude: commune.centre.coordinates[1],
        longitude: commune.centre.coordinates[0],
        seoEnabled: true
      }
    })

    console.log(`\n✅ Ville ajoutée avec succès!`)
    console.log(`   ID: ${city.id}`)
    console.log(`   Nom: ${city.name}`)
    console.log(`   Slug: ${city.slug}`)
    console.log(`   URL: /photovoltaique/${city.slug}`)

    return city

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Récupérer le nom de la ville depuis les arguments
const cityName = process.argv[2] || 'Le Puy-en-Velay'

addCity(cityName)
  .then(() => {
    console.log('\n✅ Opération terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
