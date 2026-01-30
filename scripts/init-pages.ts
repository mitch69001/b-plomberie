import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initialisation des pages...')

  const pagesToCreate = [
    {
      title: 'Mentions Légales',
      slug: 'mentions-legales',
      category: 'legal',
      metaTitle: 'Mentions Légales | Installateurs Panneaux Solaires',
      metaDescription: 'Mentions légales du site Installateurs Panneaux Solaires',
    },
    {
      title: 'Politique de Confidentialité',
      slug: 'politique-confidentialite',
      category: 'legal',
      metaTitle: 'Politique de Confidentialité | Installateurs Panneaux Solaires',
      metaDescription: 'Politique de confidentialité et protection des données personnelles',
    },
    {
      title: 'Conditions Générales d\'Utilisation',
      slug: 'cgu',
      category: 'legal',
      metaTitle: 'CGU | Installateurs Panneaux Solaires',
      metaDescription: 'Conditions Générales d\'Utilisation du site',
    },
    {
      title: 'Contact',
      slug: 'contact',
      category: 'legal',
      metaTitle: 'Contact | Installateurs Panneaux Solaires',
      metaDescription: 'Contactez notre équipe pour toute question',
    },
    {
      title: 'Guide du Photovoltaïque',
      slug: 'guide-photovoltaique',
      category: 'resource',
      metaTitle: 'Guide du Photovoltaïque 2026 | Tout savoir sur les panneaux solaires',
      metaDescription: 'Guide complet pour comprendre et installer des panneaux solaires photovoltaïques',
    },
    {
      title: 'Aides et Subventions',
      slug: 'aides-subventions',
      category: 'resource',
      metaTitle: 'Aides et Subventions Panneaux Solaires 2026',
      metaDescription: 'Toutes les aides et subventions pour l\'installation de panneaux solaires en 2026',
    },
    {
      title: 'Calculer mes Économies',
      slug: 'calculer-economies',
      category: 'resource',
      metaTitle: 'Calculer vos Économies avec des Panneaux Solaires',
      metaDescription: 'Calculez vos économies d\'énergie avec des panneaux solaires',
    },
  ]

  let created = 0
  let skipped = 0

  for (const pageData of pagesToCreate) {
    try {
      const existing = await prisma.page.findUnique({
        where: { slug: pageData.slug },
      })

      if (existing) {
        console.log(`⚠️  Page "${pageData.title}" existe déjà, ignorée`)
        skipped++
        continue
      }

      await prisma.page.create({
        data: {
          ...pageData,
          content: `<div class="prose max-w-none">
  <h1>${pageData.title}</h1>
  <p>Contenu à générer depuis l'admin...</p>
  <p>Pour générer automatiquement le contenu, rendez-vous dans l'admin et cliquez sur "Générer le contenu (IA)"</p>
</div>`,
          published: false, // Non publié par défaut
        },
      })

      console.log(`✅ Page "${pageData.title}" créée`)
      created++
    } catch (error) {
      console.error(`❌ Erreur lors de la création de "${pageData.title}":`, error)
    }
  }

  console.log(`\n✨ Terminé !`)
  console.log(`   ✅ ${created} page(s) créée(s)`)
  console.log(`   ⚠️  ${skipped} page(s) déjà existante(s)`)
  console.log(`\n💡 Rendez-vous dans l'admin (/admin/pages) pour générer le contenu automatiquement !`)
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
