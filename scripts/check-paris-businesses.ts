/**
 * Script pour vérifier les entreprises à Paris
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkParis() {
  console.log('🔍 Vérification des entreprises à Paris\n')
  
  // Récupérer Paris
  const paris = await prisma.city.findUnique({
    where: { slug: 'paris' },
    include: {
      businesses: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!paris) {
    console.error('❌ Paris non trouvé')
    return
  }
  
  console.log(`📍 ${paris.name} (${paris.postalCode})`)
  console.log(`📊 Total: ${paris.businesses.length} entreprises\n`)
  console.log('='.repeat(80))
  
  // Afficher les entreprises
  paris.businesses.forEach((business, index) => {
    console.log(`\n${index + 1}. ${business.name}`)
    console.log(`   📍 ${business.address}`)
    if (business.phone) console.log(`   📞 ${business.phone}`)
    if (business.website) console.log(`   🌐 ${business.website}`)
    if (business.rating) console.log(`   ⭐ ${business.rating}/5 (${business.reviewCount || 0} avis)`)
    
    // Services
    if (business.services) {
      const services = business.services.split(',').filter(s => s.trim())
      if (services.length > 0) {
        console.log(`   🔧 ${services.join(', ')}`)
      }
    }
    
    // Horaires
    if (business.openingHours) {
      try {
        const hours = JSON.parse(business.openingHours)
        console.log(`   🕐 Horaires disponibles`)
      } catch {
        // Ignore
      }
    }
    
    console.log(`   📅 Ajouté: ${business.createdAt.toLocaleDateString('fr-FR')}`)
    console.log(`   ✅ Scrapé: ${business.scraped ? 'Oui' : 'Non'}`)
  })
  
  console.log('\n' + '='.repeat(80))
  
  // Statistiques
  const withPhone = paris.businesses.filter(b => b.phone).length
  const withWebsite = paris.businesses.filter(b => b.website).length
  const withRating = paris.businesses.filter(b => b.rating).length
  const scraped = paris.businesses.filter(b => b.scraped).length
  
  console.log('\n📊 STATISTIQUES')
  console.log('='.repeat(80))
  console.log(`Total entreprises:     ${paris.businesses.length}`)
  console.log(`Avec téléphone:        ${withPhone} (${Math.round(withPhone/paris.businesses.length*100)}%)`)
  console.log(`Avec site web:         ${withWebsite} (${Math.round(withWebsite/paris.businesses.length*100)}%)`)
  console.log(`Avec notes:            ${withRating} (${Math.round(withRating/paris.businesses.length*100)}%)`)
  console.log(`Scrapées:              ${scraped} (${Math.round(scraped/paris.businesses.length*100)}%)`)
  console.log('='.repeat(80))
}

checkParis()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
