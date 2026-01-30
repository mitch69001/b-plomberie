import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicates() {
  console.log('🧹 Nettoyage des doublons d\'entreprises...\n')

  try {
    // Récupérer toutes les villes
    const cities = await prisma.city.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        businesses: true,
        _count: {
          select: { businesses: true }
        }
      }
    })

    console.log(`📋 ${cities.length} villes à vérifier\n`)

    let totalDuplicatesRemoved = 0

    for (const city of cities) {
      if (city.businesses.length === 0) continue

      console.log(`\n🔍 Vérification de ${city.name} (${city.businesses.length} entreprises)`)

      // Grouper les entreprises par nom
      const businessesByName = new Map<string, typeof city.businesses>()

      for (const business of city.businesses) {
        const name = business.name.trim().toLowerCase()
        
        if (!businessesByName.has(name)) {
          businessesByName.set(name, [])
        }
        businessesByName.get(name)!.push(business)
      }

      // Trouver et supprimer les doublons
      let cityDuplicates = 0

      for (const [name, businesses] of businessesByName.entries()) {
        if (businesses.length > 1) {
          console.log(`   ⚠️  Doublon trouvé : "${businesses[0].name}" (${businesses.length} occurrences)`)

          // Garder le premier (le plus ancien), supprimer les autres
          const toKeep = businesses[0]
          const toDelete = businesses.slice(1)

          for (const business of toDelete) {
            try {
              await prisma.business.delete({
                where: { id: business.id }
              })
              console.log(`      ❌ Supprimé : ${business.id}`)
              cityDuplicates++
              totalDuplicatesRemoved++
            } catch (error) {
              console.error(`      ⚠️  Erreur lors de la suppression de ${business.id}:`, error)
            }
          }

          console.log(`      ✅ Conservé : ${toKeep.id}`)
        }
      }

      if (cityDuplicates > 0) {
        console.log(`   📊 ${cityDuplicates} doublon(s) supprimé(s) pour ${city.name}`)
      } else {
        console.log(`   ✅ Aucun doublon trouvé`)
      }
    }

    console.log(`\n\n✅ Nettoyage terminé !`)
    console.log(`📊 Total de doublons supprimés : ${totalDuplicatesRemoved}`)

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanDuplicates()
  .then(() => {
    console.log('\n✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
