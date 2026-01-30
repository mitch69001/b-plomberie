/**
 * Script pour nettoyer les données de test et garder seulement les entreprises scrapées
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanTestData() {
  console.log('🧹 Nettoyage des données de test...\n')
  
  // Compter avant nettoyage
  const totalBefore = await prisma.business.count()
  const scrapedBefore = await prisma.business.count({ where: { scraped: true } })
  const testBefore = totalBefore - scrapedBefore
  
  console.log('📊 État actuel:')
  console.log(`   Total: ${totalBefore} entreprises`)
  console.log(`   Scrapées: ${scrapedBefore}`)
  console.log(`   Test: ${testBefore}\n`)
  
  // Supprimer les données de test (non scrapées)
  const result = await prisma.business.deleteMany({
    where: {
      scraped: false
    }
  })
  
  console.log(`🗑️  ${result.count} entreprises de test supprimées\n`)
  
  // Compter après nettoyage
  const totalAfter = await prisma.business.count()
  const scrapedAfter = await prisma.business.count({ where: { scraped: true } })
  
  console.log('📊 État après nettoyage:')
  console.log(`   Total: ${totalAfter} entreprises`)
  console.log(`   Scrapées: ${scrapedAfter}`)
  console.log(`   Test: 0\n`)
  
  console.log('✅ Nettoyage terminé !')
  
  // Afficher les entreprises restantes par ville
  const citiesWithBusinesses = await prisma.city.findMany({
    include: {
      _count: {
        select: { businesses: true }
      }
    },
    where: {
      businesses: {
        some: {}
      }
    }
  })
  
  if (citiesWithBusinesses.length > 0) {
    console.log('\n📍 Villes avec entreprises:')
    citiesWithBusinesses.forEach(city => {
      console.log(`   - ${city.name}: ${city._count.businesses} entreprise(s)`)
    })
  }
}

cleanTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
