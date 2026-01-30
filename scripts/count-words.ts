/**
 * Script pour compter les mots du contenu généré
 */

import { PrismaClient } from '@prisma/client'
import { generateCityContent } from '../lib/content-generator'

const prisma = new PrismaClient()

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
}

async function analyzeWordCount() {
  console.log('📊 Analyse du nombre de mots par page\n')
  console.log('='.repeat(80))
  
  const cities = await prisma.city.findMany({
    include: {
      _count: {
        select: { businesses: true }
      }
    },
    take: 3
  })
  
  for (const city of cities) {
    const businessCount = city._count.businesses
    const content = generateCityContent(city, businessCount)
    
    const introWords = countWords(content.intro)
    const localAdvantagesWords = countWords(content.localAdvantagesText)
    const whyRGEWords = countWords(content.whyRGEText)
    const processWords = countWords(content.processText)
    const linkingWords = countWords(stripHtml(content.internalLinkingText))
    
    const totalWords = introWords + localAdvantagesWords + whyRGEWords + processWords + linkingWords
    
    console.log(`\n🏙️  ${city.name} (${city.region})`)
    console.log('-'.repeat(80))
    console.log(`  Introduction:           ${introWords.toString().padStart(4)} mots`)
    console.log(`  Avantages locaux:       ${localAdvantagesWords.toString().padStart(4)} mots`)
    console.log(`  Pourquoi RGE:           ${whyRGEWords.toString().padStart(4)} mots`)
    console.log(`  Processus:              ${processWords.toString().padStart(4)} mots`)
    console.log(`  Maillage interne:       ${linkingWords.toString().padStart(4)} mots`)
    console.log(`  ${'─'.repeat(40)}`)
    console.log(`  TOTAL:                  ${totalWords.toString().padStart(4)} mots`)
    
    if (totalWords >= 350 && totalWords <= 450) {
      console.log(`  ✅ Objectif atteint (350-450 mots)`)
    } else if (totalWords < 350) {
      console.log(`  ⚠️  En dessous de l'objectif (${350 - totalWords} mots manquants)`)
    } else {
      console.log(`  ⚠️  Au-dessus de l'objectif (${totalWords - 450} mots en trop)`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n📝 Note: Ce comptage ne prend pas en compte les FAQ qui ajoutent environ 200-300 mots supplémentaires.')
}

analyzeWordCount()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
