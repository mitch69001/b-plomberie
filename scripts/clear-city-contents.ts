/**
 * Script pour supprimer tous les contenus personnalisés des villes
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearCityContents() {
  console.log('🧹 Suppression des contenus personnalisés...\n')
  
  try {
    const result = await prisma.city.updateMany({
      where: {
        customContent: {
          not: null
        }
      },
      data: {
        customContent: null
      }
    })
    
    console.log(`✅ ${result.count} contenus supprimés`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearCityContents()
  .then(() => {
    console.log('\n✅ Suppression terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
