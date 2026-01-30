/**
 * Script pour supprimer les entreprises qui ne sont pas des installateurs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeNonInstallers() {
  console.log('🔍 Recherche des entreprises non-installatrices...\n')
  
  // Liste des catégories à exclure
  const excludeKeywords = [
    'association',
    'organization',
    'training',
    'school',
    'formation',
    'news',
    'journal',
    'média',
    'media'
  ]
  
  // Récupérer toutes les entreprises
  const businesses = await prisma.business.findMany()
  
  const toDelete: string[] = []
  
  for (const business of businesses) {
    // Vérifier les services/catégories
    if (business.services) {
      const services = business.services.toLowerCase()
      
      for (const keyword of excludeKeywords) {
        if (services.includes(keyword)) {
          toDelete.push(business.id)
          console.log(`❌ À supprimer: ${business.name}`)
          console.log(`   Raison: ${business.services}`)
          break
        }
      }
    }
  }
  
  console.log(`\n🗑️  ${toDelete.length} entreprise(s) à supprimer\n`)
  
  if (toDelete.length > 0) {
    const result = await prisma.business.deleteMany({
      where: {
        id: { in: toDelete }
      }
    })
    
    console.log(`✅ ${result.count} entreprise(s) supprimée(s)\n`)
  }
  
  // Compter les entreprises restantes
  const remaining = await prisma.business.count()
  console.log(`📊 Entreprises restantes: ${remaining}`)
}

removeNonInstallers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
