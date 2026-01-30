import { PrismaClient as PrismaClientSQLite } from '@prisma/client'
import { PrismaClient as PrismaClientPostgres } from '@prisma/client'

// Client SQLite (source)
const sqlite = new PrismaClientSQLite({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
})

// Client PostgreSQL (destination) - utilise DATABASE_URL de .env
const postgres = new PrismaClientPostgres()

async function migrate() {
  console.log('🚀 Migration SQLite → PostgreSQL\n')

  try {
    // 1. Migrer les régions
    console.log('📍 Migration des régions...')
    const regions = await sqlite.region.findMany()
    console.log(`   Trouvé: ${regions.length} régions`)
    
    for (const region of regions) {
      await postgres.region.upsert({
        where: { slug: region.slug },
        update: region,
        create: region
      })
    }
    console.log(`   ✅ ${regions.length} régions migrées\n`)

    // 2. Migrer les départements
    console.log('📍 Migration des départements...')
    const departments = await sqlite.department.findMany()
    console.log(`   Trouvé: ${departments.length} départements`)
    
    for (const dept of departments) {
      await postgres.department.upsert({
        where: { slug: dept.slug },
        update: dept,
        create: dept
      })
    }
    console.log(`   ✅ ${departments.length} départements migrés\n`)

    // 3. Migrer les villes
    console.log('🏙️  Migration des villes...')
    const cities = await sqlite.city.findMany()
    console.log(`   Trouvé: ${cities.length} villes`)
    
    let cityCount = 0
    for (const city of cities) {
      await postgres.city.upsert({
        where: { slug: city.slug },
        update: city,
        create: city
      })
      cityCount++
      if (cityCount % 10 === 0) {
        console.log(`   Progression: ${cityCount}/${cities.length}`)
      }
    }
    console.log(`   ✅ ${cities.length} villes migrées\n`)

    // 4. Migrer les entreprises
    console.log('🏢 Migration des entreprises...')
    const businesses = await sqlite.business.findMany()
    console.log(`   Trouvé: ${businesses.length} entreprises`)
    
    let businessCount = 0
    for (const business of businesses) {
      try {
        await postgres.business.create({
          data: business
        })
        businessCount++
        if (businessCount % 50 === 0) {
          console.log(`   Progression: ${businessCount}/${businesses.length}`)
        }
      } catch (error: any) {
        // Ignorer les doublons
        if (!error.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Erreur pour "${business.name}": ${error.message}`)
        }
      }
    }
    console.log(`   ✅ ${businessCount} entreprises migrées\n`)

    // 5. Migrer les admins
    console.log('👤 Migration des admins...')
    const admins = await sqlite.admin.findMany()
    console.log(`   Trouvé: ${admins.length} admins`)
    
    for (const admin of admins) {
      await postgres.admin.upsert({
        where: { email: admin.email },
        update: admin,
        create: admin
      })
    }
    console.log(`   ✅ ${admins.length} admins migrés\n`)

    // 6. Migrer les leads
    console.log('📧 Migration des leads...')
    const leads = await sqlite.lead.findMany()
    console.log(`   Trouvé: ${leads.length} leads`)
    
    let leadCount = 0
    for (const lead of leads) {
      try {
        await postgres.lead.create({
          data: lead
        })
        leadCount++
      } catch (error: any) {
        if (!error.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Erreur pour lead ${lead.id}: ${error.message}`)
        }
      }
    }
    console.log(`   ✅ ${leadCount} leads migrés\n`)

    // 7. Migrer les logs de scraping
    console.log('📝 Migration des logs de scraping...')
    const logs = await sqlite.scrapingLog.findMany()
    console.log(`   Trouvé: ${logs.length} logs`)
    
    let logCount = 0
    for (const log of logs) {
      try {
        await postgres.scrapingLog.create({
          data: log
        })
        logCount++
      } catch (error: any) {
        // Ignorer les erreurs
      }
    }
    console.log(`   ✅ ${logCount} logs migrés\n`)

    // Statistiques finales
    console.log('═'.repeat(60))
    console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS!\n')
    console.log('📊 Récapitulatif:')
    console.log(`   • ${regions.length} régions`)
    console.log(`   • ${departments.length} départements`)
    console.log(`   • ${cities.length} villes`)
    console.log(`   • ${businessCount} entreprises`)
    console.log(`   • ${admins.length} admins`)
    console.log(`   • ${leadCount} leads`)
    console.log(`   • ${logCount} logs de scraping`)
    console.log('\n' + '═'.repeat(60))

  } catch (error) {
    console.error('\n❌ Erreur durant la migration:', error)
    throw error
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

migrate()
  .then(() => {
    console.log('\n✅ Migration terminée!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
