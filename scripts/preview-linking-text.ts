/**
 * Script pour prévisualiser le texte de maillage interne généré
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fonction slugify copiée du générateur
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function previewLinkingText() {
  console.log('📝 Aperçu des textes de maillage interne\n')
  console.log('='.repeat(80))
  
  const cities = await prisma.city.findMany({
    take: 6
  })
  
  for (const city of cities) {
    console.log(`\n🏙️  ${city.name} (${city.department}, ${city.region})`)
    console.log('-'.repeat(80))
    console.log(`\nLiens générés:`)
    console.log(`  🗺️  Région: /photovoltaique/region/${slugify(city.region)}`)
    console.log('')
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ Ces liens seront automatiquement générés en bas de chaque page ville')
  console.log('📌 Le texte varie selon la ville pour éviter le duplicate content')
  console.log('\n💡 Structure du maillage:')
  console.log('   - Ville → Région')
  console.log('   - Le département est mentionné dans le texte mais sans lien')
  console.log('   - Focus sur le maillage vers les pages régions qui existent')
}

previewLinkingText()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
