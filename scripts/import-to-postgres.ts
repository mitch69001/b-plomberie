import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Import des données dans PostgreSQL...\n')

  try {
    const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'))

    // 1. Régions
    console.log('📍 Import des régions...')
    for (const region of data.regions) {
      await prisma.region.upsert({
        where: { slug: region.slug },
        update: region,
        create: region
      })
    }
    console.log(`   ✅ ${data.regions.length} régions\n`)

    // 2. Départements
    console.log('📍 Import des départements...')
    for (const dept of data.departments) {
      await prisma.department.upsert({
        where: { slug: dept.slug },
        update: dept,
        create: dept
      })
    }
    console.log(`   ✅ ${data.departments.length} départements\n`)

    // 3. Villes
    console.log('🏙️  Import des villes...')
    let cityCount = 0
    for (const city of data.cities) {
      await prisma.city.upsert({
        where: { slug: city.slug },
        update: city,
        create: city
      })
      cityCount++
      if (cityCount % 10 === 0) {
        console.log(`   Progression: ${cityCount}/${data.cities.length}`)
      }
    }
    console.log(`   ✅ ${data.cities.length} villes\n`)

    // 4. Entreprises
    console.log('🏢 Import des entreprises...')
    let businessCount = 0
    for (const business of data.businesses) {
      try {
        await prisma.business.create({
          data: business
        })
        businessCount++
        if (businessCount % 50 === 0) {
          console.log(`   Progression: ${businessCount}/${data.businesses.length}`)
        }
      } catch (error: any) {
        // Ignorer les doublons
      }
    }
    console.log(`   ✅ ${businessCount} entreprises\n`)

    // 5. Admins
    console.log('👤 Import des admins...')
    for (const admin of data.admins) {
      await prisma.admin.upsert({
        where: { email: admin.email },
        update: admin,
        create: admin
      })
    }
    console.log(`   ✅ ${data.admins.length} admins\n`)

    // 6. Leads
    console.log('📧 Import des leads...')
    let leadCount = 0
    for (const lead of data.leads) {
      try {
        await prisma.lead.create({
          data: lead
        })
        leadCount++
      } catch (error: any) {
        // Ignorer les doublons
      }
    }
    console.log(`   ✅ ${leadCount} leads\n`)

    // 7. Logs
    console.log('📝 Import des logs...')
    let logCount = 0
    for (const log of data.scrapingLogs) {
      try {
        await prisma.scrapingLog.create({
          data: log
        })
        logCount++
      } catch (error: any) {
        // Ignorer les erreurs
      }
    }
    console.log(`   ✅ ${logCount} logs\n`)

    console.log('═'.repeat(60))
    console.log('\n✅ IMPORT TERMINÉ!\n')
    console.log('📊 Récapitulatif:')
    console.log(`   • ${data.regions.length} régions`)
    console.log(`   • ${data.departments.length} départements`)
    console.log(`   • ${data.cities.length} villes`)
    console.log(`   • ${businessCount} entreprises`)
    console.log(`   • ${data.admins.length} admins`)
    console.log(`   • ${leadCount} leads`)
    console.log(`   • ${logCount} logs`)
    console.log('\n' + '═'.repeat(60))

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importData()
