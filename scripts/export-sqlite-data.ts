import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function exportData() {
  console.log('📤 Export des données SQLite...\n')

  try {
    const data = {
      regions: await prisma.region.findMany(),
      departments: await prisma.department.findMany(),
      cities: await prisma.city.findMany(),
      businesses: await prisma.business.findMany(),
      admins: await prisma.admin.findMany(),
      leads: await prisma.lead.findMany(),
      scrapingLogs: await prisma.scrapingLog.findMany()
    }

    console.log('📊 Données trouvées:')
    console.log(`   • ${data.regions.length} régions`)
    console.log(`   • ${data.departments.length} départements`)
    console.log(`   • ${data.cities.length} villes`)
    console.log(`   • ${data.businesses.length} entreprises`)
    console.log(`   • ${data.admins.length} admins`)
    console.log(`   • ${data.leads.length} leads`)
    console.log(`   • ${data.scrapingLogs.length} logs`)

    fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2))
    console.log('\n✅ Export terminé → data-export.json')

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
