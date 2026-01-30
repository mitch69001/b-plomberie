import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function syncRegionsAndDepartments() {
  console.log('🔄 Synchronisation des régions et départements...\n')

  // 1. Récupérer toutes les villes
  const cities = await prisma.city.findMany({
    select: {
      region: true,
      department: true
    }
  })

  console.log(`📊 ${cities.length} ville(s) trouvée(s) dans la base\n`)

  // 2. Extraire les régions et départements uniques
  const regionMap: Map<string, Set<string>> = new Map()

  cities.forEach(city => {
    if (!regionMap.has(city.region)) {
      regionMap.set(city.region, new Set())
    }
    regionMap.get(city.region)!.add(city.department)
  })

  console.log(`📍 ${regionMap.size} région(s) unique(s) détectée(s)`)
  console.log(`🗺️  ${Array.from(regionMap.values()).reduce((sum, depts) => sum + depts.size, 0)} département(s) unique(s) détecté(s)\n`)

  // 3. Créer les régions
  console.log('🏗️  Création des régions...')
  let regionsCreated = 0
  let regionsExisting = 0

  for (const [regionName, departments] of regionMap.entries()) {
    try {
      const existing = await prisma.region.findUnique({
        where: { slug: slugify(regionName) }
      })

      if (existing) {
        console.log(`   ✓ ${regionName} (existe déjà)`)
        regionsExisting++
      } else {
        await prisma.region.create({
          data: {
            name: regionName,
            slug: slugify(regionName),
            description: `Région ${regionName}`,
            active: true
          }
        })
        console.log(`   ✅ ${regionName} (créée)`)
        regionsCreated++
      }
    } catch (error: any) {
      console.error(`   ❌ Erreur pour ${regionName}:`, error.message)
    }
  }

  console.log(`\n📊 Résumé régions: ${regionsCreated} créée(s), ${regionsExisting} existante(s)\n`)

  // 4. Créer les départements
  console.log('🏗️  Création des départements...')
  let departmentsCreated = 0
  let departmentsExisting = 0

  for (const [regionName, departments] of regionMap.entries()) {
    // Récupérer l'ID de la région
    const region = await prisma.region.findUnique({
      where: { slug: slugify(regionName) }
    })

    if (!region) {
      console.error(`   ❌ Région ${regionName} non trouvée`)
      continue
    }

    for (const deptName of Array.from(departments)) {
      try {
        const existing = await prisma.department.findUnique({
          where: { slug: slugify(deptName) }
        })

        if (existing) {
          console.log(`   ✓ ${deptName} (${regionName}) - existe déjà`)
          departmentsExisting++
        } else {
          // Extraire le code département si possible (ex: "75" depuis "Paris")
          const codeMatch = deptName.match(/\d{2,3}/)
          const code = codeMatch ? codeMatch[0] : null

          await prisma.department.create({
            data: {
              name: deptName,
              slug: slugify(deptName),
              code: code,
              regionId: region.id,
              active: true
            }
          })
          console.log(`   ✅ ${deptName} (${regionName}) - créé`)
          departmentsCreated++
        }
      } catch (error: any) {
        console.error(`   ❌ Erreur pour ${deptName}:`, error.message)
      }
    }
  }

  console.log(`\n📊 Résumé départements: ${departmentsCreated} créé(s), ${departmentsExisting} existant(s)\n`)

  // 5. Afficher un résumé final
  console.log('✅ Synchronisation terminée!\n')
  console.log('📋 Résumé de la base de données:')
  
  const totalRegions = await prisma.region.count()
  const totalDepartments = await prisma.department.count()
  const totalCities = await prisma.city.count()

  console.log(`   • Régions: ${totalRegions}`)
  console.log(`   • Départements: ${totalDepartments}`)
  console.log(`   • Villes: ${totalCities}`)

  // 6. Afficher les régions avec leurs départements
  console.log('\n📍 Hiérarchie complète:')
  const regionsWithDepts = await prisma.region.findMany({
    include: {
      departments: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  })

  regionsWithDepts.forEach(region => {
    console.log(`\n   ${region.name} (${region.departments.length} département(s))`)
    region.departments.forEach(dept => {
      console.log(`      → ${dept.name}${dept.code ? ` (${dept.code})` : ''}`)
    })
  })

  await prisma.$disconnect()
}

syncRegionsAndDepartments()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
