import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCity() {
  const cityName = process.argv[2] || 'Metz'
  
  console.log(`\n🔍 Vérification de la ville: ${cityName}\n`)

  const city = await prisma.city.findFirst({
    where: {
      name: cityName
    }
  })

  if (!city) {
    console.log(`❌ Ville "${cityName}" non trouvée dans la base de données`)
    return
  }

  console.log('✅ Ville trouvée:')
  console.log(`   ID: ${city.id}`)
  console.log(`   Nom: ${city.name}`)
  console.log(`   Slug: ${city.slug}`)
  console.log(`   Code postal: ${city.postalCode}`)
  console.log(`   Département: ${city.department}`)
  console.log(`   Région: ${city.region}`)
  console.log(`   Population: ${city.population || 'Non renseignée'}`)
  console.log(`   Latitude: ${city.latitude}`)
  console.log(`   Longitude: ${city.longitude}`)
  
  if (!city.latitude || !city.longitude) {
    console.log('\n⚠️  PROBLÈME: Les coordonnées GPS sont manquantes!')
  }

  // Vérifier les entreprises
  const businessCount = await prisma.business.count({
    where: { cityId: city.id }
  })

  console.log(`\n📊 ${businessCount} entreprise(s) pour cette ville`)

  await prisma.$disconnect()
}

checkCity().catch(console.error)
