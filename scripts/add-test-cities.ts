/**
 * Script pour ajouter quelques villes de test
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testCities = [
  {
    name: 'Lyon',
    slug: 'lyon',
    postalCode: '69001',
    department: 'Rhône',
    region: 'Auvergne-Rhône-Alpes',
    population: 516092,
    latitude: 45.764043,
    longitude: 4.835659,
  },
  {
    name: 'Marseille',
    slug: 'marseille',
    postalCode: '13001',
    department: 'Bouches-du-Rhône',
    region: 'Provence-Alpes-Côte d\'Azur',
    population: 869815,
    latitude: 43.296482,
    longitude: 5.36978,
  },
  {
    name: 'Toulouse',
    slug: 'toulouse',
    postalCode: '31000',
    department: 'Haute-Garonne',
    region: 'Occitanie',
    population: 471941,
    latitude: 43.604652,
    longitude: 1.444209,
  },
  {
    name: 'Nice',
    slug: 'nice',
    postalCode: '06000',
    department: 'Alpes-Maritimes',
    region: 'Provence-Alpes-Côte d\'Azur',
    population: 340017,
    latitude: 43.710173,
    longitude: 7.261953,
  },
  {
    name: 'Bordeaux',
    slug: 'bordeaux',
    postalCode: '33000',
    department: 'Gironde',
    region: 'Nouvelle-Aquitaine',
    population: 252040,
    latitude: 44.837789,
    longitude: -0.57918,
  },
]

async function addTestCities() {
  console.log('🏙️  Ajout de villes de test...\n')
  
  for (const city of testCities) {
    try {
      const existing = await prisma.city.findUnique({
        where: { slug: city.slug }
      })
      
      if (existing) {
        console.log(`⏭️  ${city.name} existe déjà`)
      } else {
        await prisma.city.create({ data: city })
        console.log(`✅ ${city.name} ajoutée`)
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${city.name}:`, error)
    }
  }
  
  console.log('\n📊 Villes dans la base:')
  const allCities = await prisma.city.findMany({
    select: { name: true, region: true }
  })
  
  allCities.forEach(city => {
    console.log(`   - ${city.name} (${city.region})`)
  })
}

addTestCities()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
