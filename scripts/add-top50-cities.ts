import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Top 50 des villes françaises par population
const TOP_50_CITIES = [
  { name: 'Paris', population: 2145906, department: 'Paris', region: 'Île-de-France', postalCode: '75000', lat: 48.8566, lng: 2.3522 },
  { name: 'Marseille', population: 870731, department: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '13000', lat: 43.2965, lng: 5.3698 },
  { name: 'Lyon', population: 516092, department: 'Rhône', region: 'Auvergne-Rhône-Alpes', postalCode: '69000', lat: 45.7640, lng: 4.8357 },
  { name: 'Toulouse', population: 479553, department: 'Haute-Garonne', region: 'Occitanie', postalCode: '31000', lat: 43.6047, lng: 1.4442 },
  { name: 'Nice', population: 341522, department: 'Alpes-Maritimes', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '06000', lat: 43.7102, lng: 7.2620 },
  { name: 'Nantes', population: 309346, department: 'Loire-Atlantique', region: 'Pays de la Loire', postalCode: '44000', lat: 47.2184, lng: -1.5536 },
  { name: 'Strasbourg', population: 280966, department: 'Bas-Rhin', region: 'Grand Est', postalCode: '67000', lat: 48.5734, lng: 7.7521 },
  { name: 'Montpellier', population: 285121, department: 'Hérault', region: 'Occitanie', postalCode: '34000', lat: 43.6108, lng: 3.8767 },
  { name: 'Bordeaux', population: 254436, department: 'Gironde', region: 'Nouvelle-Aquitaine', postalCode: '33000', lat: 44.8378, lng: -0.5792 },
  { name: 'Lille', population: 232741, department: 'Nord', region: 'Hauts-de-France', postalCode: '59000', lat: 50.6292, lng: 3.0573 },
  { name: 'Rennes', population: 216815, department: 'Ille-et-Vilaine', region: 'Bretagne', postalCode: '35000', lat: 48.1173, lng: -1.6778 },
  { name: 'Reims', population: 182460, department: 'Marne', region: 'Grand Est', postalCode: '51100', lat: 49.2583, lng: 4.0317 },
  { name: 'Toulon', population: 176198, department: 'Var', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '83000', lat: 43.1242, lng: 5.9280 },
  { name: 'Saint-Étienne', population: 172565, department: 'Loire', region: 'Auvergne-Rhône-Alpes', postalCode: '42000', lat: 45.4397, lng: 4.3872 },
  { name: 'Le Havre', population: 170147, department: 'Seine-Maritime', region: 'Normandie', postalCode: '76600', lat: 49.4944, lng: 0.1079 },
  { name: 'Grenoble', population: 158454, department: 'Isère', region: 'Auvergne-Rhône-Alpes', postalCode: '38000', lat: 45.1885, lng: 5.7245 },
  { name: 'Dijon', population: 156920, department: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté', postalCode: '21000', lat: 47.3220, lng: 5.0415 },
  { name: 'Angers', population: 152960, department: 'Maine-et-Loire', region: 'Pays de la Loire', postalCode: '49000', lat: 47.4784, lng: -0.5632 },
  { name: 'Nîmes', population: 150610, department: 'Gard', region: 'Occitanie', postalCode: '30000', lat: 43.8367, lng: 4.3601 },
  { name: 'Villeurbanne', population: 149019, department: 'Rhône', region: 'Auvergne-Rhône-Alpes', postalCode: '69100', lat: 45.7667, lng: 4.8800 },
  { name: 'Le Mans', population: 143813, department: 'Sarthe', region: 'Pays de la Loire', postalCode: '72000', lat: 48.0077, lng: 0.1984 },
  { name: 'Aix-en-Provence', population: 143006, department: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '13100', lat: 43.5297, lng: 5.4474 },
  { name: 'Clermont-Ferrand', population: 143886, department: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes', postalCode: '63000', lat: 45.7772, lng: 3.0870 },
  { name: 'Brest', population: 139384, department: 'Finistère', region: 'Bretagne', postalCode: '29200', lat: 48.3905, lng: -4.4861 },
  { name: 'Tours', population: 136463, department: 'Indre-et-Loire', region: 'Centre-Val de Loire', postalCode: '37000', lat: 47.3941, lng: 0.6848 },
  { name: 'Limoges', population: 132175, department: 'Haute-Vienne', region: 'Nouvelle-Aquitaine', postalCode: '87000', lat: 45.8336, lng: 1.2611 },
  { name: 'Amiens', population: 133755, department: 'Somme', region: 'Hauts-de-France', postalCode: '80000', lat: 49.8941, lng: 2.2958 },
  { name: 'Perpignan', population: 121934, department: 'Pyrénées-Orientales', region: 'Occitanie', postalCode: '66000', lat: 42.6886, lng: 2.8948 },
  { name: 'Metz', population: 116429, department: 'Moselle', region: 'Grand Est', postalCode: '57000', lat: 49.1193, lng: 6.1757 },
  { name: 'Besançon', population: 116914, department: 'Doubs', region: 'Bourgogne-Franche-Comté', postalCode: '25000', lat: 47.2380, lng: 6.0243 },
  { name: 'Orléans', population: 116238, department: 'Loiret', region: 'Centre-Val de Loire', postalCode: '45000', lat: 47.9029, lng: 1.9093 },
  { name: 'Rouen', population: 110145, department: 'Seine-Maritime', region: 'Normandie', postalCode: '76000', lat: 49.4432, lng: 1.0993 },
  { name: 'Mulhouse', population: 108942, department: 'Haut-Rhin', region: 'Grand Est', postalCode: '68100', lat: 47.7508, lng: 7.3359 },
  { name: 'Caen', population: 105512, department: 'Calvados', region: 'Normandie', postalCode: '14000', lat: 49.1829, lng: -0.3707 },
  { name: 'Boulogne-Billancourt', population: 117931, department: 'Hauts-de-Seine', region: 'Île-de-France', postalCode: '92100', lat: 48.8354, lng: 2.2397 },
  { name: 'Nancy', population: 104885, department: 'Meurthe-et-Moselle', region: 'Grand Est', postalCode: '54000', lat: 48.6921, lng: 6.1844 },
  { name: 'Argenteuil', population: 110210, department: 'Val-d\'Oise', region: 'Île-de-France', postalCode: '95100', lat: 48.9474, lng: 2.2466 },
  { name: 'Montreuil', population: 108991, department: 'Seine-Saint-Denis', region: 'Île-de-France', postalCode: '93100', lat: 48.8634, lng: 2.4432 },
  { name: 'Roubaix', population: 96990, department: 'Nord', region: 'Hauts-de-France', postalCode: '59100', lat: 50.6892, lng: 3.1746 },
  { name: 'Tourcoing', population: 97476, department: 'Nord', region: 'Hauts-de-France', postalCode: '59200', lat: 50.7236, lng: 3.1609 },
  { name: 'Nanterre', population: 95077, department: 'Hauts-de-Seine', region: 'Île-de-France', postalCode: '92000', lat: 48.8925, lng: 2.2069 },
  { name: 'Avignon', population: 91143, department: 'Vaucluse', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '84000', lat: 43.9493, lng: 4.8055 },
  { name: 'Vitry-sur-Seine', population: 93667, department: 'Val-de-Marne', region: 'Île-de-France', postalCode: '94400', lat: 48.7872, lng: 2.3939 },
  { name: 'Créteil', population: 91042, department: 'Val-de-Marne', region: 'Île-de-France', postalCode: '94000', lat: 48.7903, lng: 2.4555 },
  { name: 'Dunkerque', population: 87353, department: 'Nord', region: 'Hauts-de-France', postalCode: '59140', lat: 51.0343, lng: 2.3767 },
  { name: 'Poitiers', population: 88665, department: 'Vienne', region: 'Nouvelle-Aquitaine', postalCode: '86000', lat: 46.5802, lng: 0.3404 },
  { name: 'Asnières-sur-Seine', population: 86742, department: 'Hauts-de-Seine', region: 'Île-de-France', postalCode: '92600', lat: 48.9146, lng: 2.2870 },
  { name: 'Versailles', population: 85416, department: 'Yvelines', region: 'Île-de-France', postalCode: '78000', lat: 48.8048, lng: 2.1203 },
  { name: 'Colombes', population: 86188, department: 'Hauts-de-Seine', region: 'Île-de-France', postalCode: '92700', lat: 48.9233, lng: 2.2531 },
  { name: 'Aulnay-sous-Bois', population: 85740, department: 'Seine-Saint-Denis', region: 'Île-de-France', postalCode: '93600', lat: 48.9534, lng: 2.4962 }
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('🔍 Vérification des villes existantes...\n')
  
  // Récupérer toutes les villes existantes
  const existingCities = await prisma.city.findMany({
    select: { slug: true, name: true }
  })
  
  const existingSlugs = new Set(existingCities.map(c => c.slug))
  console.log(`✓ ${existingCities.length} villes déjà dans la base de données\n`)
  
  // Filtrer les villes à ajouter
  const citiesToAdd = TOP_50_CITIES.filter(city => {
    const slug = slugify(city.name)
    return !existingSlugs.has(slug)
  })
  
  console.log(`📊 Villes à ajouter : ${citiesToAdd.length}/${TOP_50_CITIES.length}\n`)
  
  if (citiesToAdd.length === 0) {
    console.log('✅ Toutes les villes du top 50 sont déjà présentes!')
    return
  }
  
  let regionsCreated = 0
  let departmentsCreated = 0
  let citiesCreated = 0
  
  for (const cityData of citiesToAdd) {
    const slug = slugify(cityData.name)
    
    console.log(`\n🏙️  ${cityData.name}`)
    
    // 1. Créer ou récupérer la région
    let region = await prisma.region.findFirst({
      where: { name: cityData.region }
    })
    
    if (!region) {
      region = await prisma.region.create({
        data: {
          name: cityData.region,
          slug: slugify(cityData.region)
        }
      })
      regionsCreated++
      console.log(`   ✓ Région créée: ${cityData.region}`)
    } else {
      console.log(`   ○ Région existe: ${cityData.region}`)
    }
    
    // 2. Créer ou récupérer le département
    let department = await prisma.department.findFirst({
      where: { 
        name: cityData.department,
        regionId: region.id
      }
    })
    
    if (!department) {
      department = await prisma.department.create({
        data: {
          name: cityData.department,
          slug: slugify(cityData.department),
          regionId: region.id
        }
      })
      departmentsCreated++
      console.log(`   ✓ Département créé: ${cityData.department}`)
    } else {
      console.log(`   ○ Département existe: ${cityData.department}`)
    }
    
    // 3. Créer la ville
    await prisma.city.create({
      data: {
        name: cityData.name,
        slug: slug,
        department: cityData.department,
        region: cityData.region,
        postalCode: cityData.postalCode,
        population: cityData.population,
        latitude: cityData.lat,
        longitude: cityData.lng,
        seoEnabled: true
      }
    })
    citiesCreated++
    console.log(`   ✓ Ville créée: ${cityData.name} (${cityData.population.toLocaleString()} hab.)`)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ TERMINÉ!')
  console.log('='.repeat(60))
  console.log(`📍 Régions créées: ${regionsCreated}`)
  console.log(`📍 Départements créés: ${departmentsCreated}`)
  console.log(`🏙️  Villes créées: ${citiesCreated}`)
  console.log('='.repeat(60))
  
  // Afficher un résumé des villes totales
  const totalCities = await prisma.city.count()
  console.log(`\n📊 Total de villes dans la base: ${totalCities}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
