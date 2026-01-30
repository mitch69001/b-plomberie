/**
 * Script pour créer des données de test rapidement
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Création de données de test...\n')

  // Créer quelques villes de test
  const cities = [
    {
      name: 'Paris',
      slug: 'paris',
      postalCode: '75001',
      department: 'Paris',
      region: 'Île-de-France',
      population: 2165423,
      latitude: 48.8566,
      longitude: 2.3522,
    },
    {
      name: 'Lyon',
      slug: 'lyon',
      postalCode: '69001',
      department: 'Rhône',
      region: 'Auvergne-Rhône-Alpes',
      population: 513275,
      latitude: 45.7640,
      longitude: 4.8357,
    },
    {
      name: 'Marseille',
      slug: 'marseille',
      postalCode: '13001',
      department: 'Bouches-du-Rhône',
      region: "Provence-Alpes-Côte d'Azur",
      population: 869815,
      latitude: 43.2965,
      longitude: 5.3698,
    },
    {
      name: 'Toulouse',
      slug: 'toulouse',
      postalCode: '31000',
      department: 'Haute-Garonne',
      region: 'Occitanie',
      population: 471941,
      latitude: 43.6047,
      longitude: 1.4442,
    },
    {
      name: 'Nice',
      slug: 'nice',
      postalCode: '06000',
      department: 'Alpes-Maritimes',
      region: "Provence-Alpes-Côte d'Azur",
      population: 340017,
      latitude: 43.7102,
      longitude: 7.2620,
    },
  ]

  console.log('📍 Création des villes...')
  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { slug: cityData.slug },
      update: cityData,
      create: cityData,
    })
    console.log(`  ✅ ${city.name}`)
  }

  // Créer quelques entreprises de test pour Paris
  const parisCity = await prisma.city.findUnique({ where: { slug: 'paris' } })
  
  if (parisCity) {
    console.log('\n🏢 Création d\'entreprises pour Paris...')
    
    const businesses = [
      {
        name: 'Solaire Plus Paris',
        address: '123 Rue de Rivoli',
        postalCode: '75001',
        cityId: parisCity.id,
        phone: '0123456789',
        website: 'https://solaire-plus.fr',
        rating: 4.8,
        reviewCount: 127,
        latitude: 48.8606,
        longitude: 2.3376,
        services: 'Installation,Maintenance,Dépannage',
        verified: true,
      },
      {
        name: 'EcoEnergie Paris',
        address: '45 Avenue des Champs-Élysées',
        postalCode: '75008',
        cityId: parisCity.id,
        phone: '0123456790',
        rating: 4.5,
        reviewCount: 89,
        latitude: 48.8698,
        longitude: 2.3080,
        services: 'Installation,Conseil',
        verified: true,
      },
      {
        name: 'Photovoltaïque Pro',
        address: '78 Boulevard Saint-Germain',
        postalCode: '75005',
        cityId: parisCity.id,
        phone: '0123456791',
        website: 'https://pv-pro.fr',
        rating: 4.9,
        reviewCount: 203,
        latitude: 48.8534,
        longitude: 2.3488,
        services: 'Installation,Maintenance',
        verified: true,
      },
    ]

    for (const businessData of businesses) {
      await prisma.business.create({
        data: businessData,
      })
      console.log(`  ✅ ${businessData.name}`)
    }
  }

  // Créer un lead de test
  console.log('\n📧 Création d\'un lead de test...')
  if (parisCity) {
    await prisma.lead.create({
      data: {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '0612345678',
        cityId: parisCity.id,
        postalCode: '75001',
        projectType: 'installation',
        message: 'Je souhaite installer des panneaux solaires sur ma maison.',
        budget: '10-15k',
        surface: 30,
        status: 'nouveau',
        source: 'test',
      },
    })
    console.log('  ✅ Lead créé')
  }

  console.log('\n✅ Données de test créées avec succès!\n')
  console.log('🚀 Vous pouvez maintenant lancer le serveur avec: npm run dev\n')
  console.log('📍 Pages à tester:')
  console.log('   - http://localhost:3000')
  console.log('   - http://localhost:3000/photovoltaique')
  console.log('   - http://localhost:3000/photovoltaique/paris')
  console.log('   - http://localhost:3000/admin/dashboard')
  console.log('   - http://localhost:3000/admin/leads\n')
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
