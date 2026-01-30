/**
 * Script de génération d'images Open Graph pour chaque ville
 * Génère des images OG personnalisées pour améliorer le partage social
 * 
 * Note: Pour une vraie implémentation, utiliser une librairie comme:
 * - @vercel/og (Next.js Image Generation)
 * - canvas (node-canvas)
 * - Puppeteer pour screenshots
 * 
 * Cette version utilise une approche simple avec des appels API
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface OGImageConfig {
  width: number
  height: number
  backgroundColor: string
  textColor: string
  accentColor: string
}

const defaultConfig: OGImageConfig = {
  width: 1200,
  height: 630,
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  accentColor: '#fbbf24',
}

/**
 * Génère une image OG pour une ville
 * Cette fonction crée un template SVG qui peut être converti en PNG
 */
async function generateOGImage(cityName: string, department: string, businessCount: number): Promise<string> {
  const svg = `
    <svg width="${defaultConfig.width}" height="${defaultConfig.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${defaultConfig.width}" height="${defaultConfig.height}" fill="url(#bg-gradient)"/>
      
      <!-- Pattern overlay -->
      <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)"/>
      </pattern>
      <rect width="${defaultConfig.width}" height="${defaultConfig.height}" fill="url(#pattern)"/>
      
      <!-- Content -->
      <g>
        <!-- Sun icon -->
        <circle cx="150" cy="200" r="60" fill="${defaultConfig.accentColor}" opacity="0.2"/>
        <circle cx="150" cy="200" r="40" fill="${defaultConfig.accentColor}"/>
        ${Array.from({length: 12}, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = 150 + Math.cos(angle) * 50
          const y1 = 200 + Math.sin(angle) * 50
          const x2 = 150 + Math.cos(angle) * 70
          const y2 = 200 + Math.sin(angle) * 70
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${defaultConfig.accentColor}" stroke-width="4" stroke-linecap="round"/>`
        }).join('')}
        
        <!-- Title -->
        <text x="300" y="180" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="${defaultConfig.textColor}">
          Panneaux Solaires
        </text>
        <text x="300" y="250" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="${defaultConfig.accentColor}">
          ${cityName}
        </text>
        
        <!-- Subtitle -->
        <text x="300" y="310" font-family="Arial, sans-serif" font-size="32" fill="${defaultConfig.textColor}" opacity="0.9">
          ${department}
        </text>
        
        <!-- Stats -->
        <rect x="300" y="350" width="700" height="120" rx="15" fill="rgba(255,255,255,0.15)"/>
        <text x="450" y="420" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${defaultConfig.accentColor}">
          ${businessCount}
        </text>
        <text x="550" y="420" font-family="Arial, sans-serif" font-size="32" fill="${defaultConfig.textColor}">
          installateurs certifiés RGE
        </text>
      </g>
      
      <!-- Footer -->
      <text x="300" y="580" font-family="Arial, sans-serif" font-size="24" fill="${defaultConfig.textColor}" opacity="0.8">
        Comparez gratuitement • Devis sans engagement
      </text>
    </svg>
  `
  
  return svg
}

/**
 * Sauvegarde l'image SVG (ou conversion en PNG avec une librairie appropriée)
 */
async function saveOGImage(citySlug: string, svgContent: string) {
  const outputDir = path.join(process.cwd(), 'public', 'og-images')
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const filepath = path.join(outputDir, `${citySlug}.svg`)
  fs.writeFileSync(filepath, svgContent)
  
  console.log(`  ✅ Image générée: ${citySlug}.svg`)
  
  // Note: Pour convertir en PNG, utiliser une librairie comme:
  // - sharp avec @resvg/resvg-js
  // - puppeteer pour prendre un screenshot
  // - API externe comme cloudinary, imgix, etc.
  
  // Exemple avec API externe (commenté):
  /*
  const pngPath = path.join(outputDir, `${citySlug}.png`)
  await convertSvgToPng(svgContent, pngPath)
  console.log(`  ✅ Image PNG générée: ${citySlug}.png`)
  */
}

/**
 * Génère les images OG pour les villes principales
 */
async function generateImagesForTopCities(limit: number = 100) {
  console.log('🎨 Génération des images Open Graph...\n')
  
  try {
    // Récupérer les villes principales (population > 10000 ou avec des entreprises)
    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { population: { gte: 10000 } },
          { businesses: { some: {} } },
        ],
      },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: [
        { population: 'desc' },
      ],
      take: limit,
    })
    
    console.log(`📍 ${cities.length} villes trouvées\n`)
    
    let generated = 0
    
    for (const city of cities) {
      try {
        const svg = await generateOGImage(
          city.name,
          city.department,
          city._count.businesses
        )
        
        await saveOGImage(city.slug, svg)
        generated++
        
        if (generated % 10 === 0) {
          console.log(`  📊 Progression: ${generated}/${cities.length}`)
        }
      } catch (error) {
        console.error(`  ❌ Erreur pour ${city.name}:`, error)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log(`✅ ${generated} images générées avec succès`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Génère une image OG par défaut pour les pages sans ville spécifique
 */
async function generateDefaultOGImage() {
  console.log('🎨 Génération de l\'image OG par défaut...')
  
  const svg = `
    <svg width="${defaultConfig.width}" height="${defaultConfig.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${defaultConfig.width}" height="${defaultConfig.height}" fill="url(#bg-gradient)"/>
      
      <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)"/>
      </pattern>
      <rect width="${defaultConfig.width}" height="${defaultConfig.height}" fill="url(#pattern)"/>
      
      <g>
        <circle cx="200" cy="315" r="80" fill="${defaultConfig.accentColor}" opacity="0.2"/>
        <circle cx="200" cy="315" r="60" fill="${defaultConfig.accentColor}"/>
        
        <text x="350" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${defaultConfig.textColor}">
          Trouvez votre installateur
        </text>
        <text x="350" y="350" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${defaultConfig.accentColor}">
          de panneaux solaires
        </text>
        <text x="350" y="420" font-family="Arial, sans-serif" font-size="36" fill="${defaultConfig.textColor}" opacity="0.9">
          35 000+ villes • Installateurs certifiés RGE
        </text>
      </g>
    </svg>
  `
  
  const outputDir = path.join(process.cwd(), 'public', 'og-images')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(path.join(outputDir, 'default.svg'), svg)
  console.log('✅ Image par défaut générée: default.svg')
}

// Exécution
async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : 100
  
  console.log('🚀 Démarrage de la génération d\'images OG\n')
  console.log(`Limite: ${limit} villes\n`)
  
  await generateDefaultOGImage()
  await generateImagesForTopCities(limit)
  
  console.log('\n✅ Génération terminée!')
  console.log('💡 Astuce: Les images SVG peuvent être converties en PNG avec sharp + resvg')
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur:', error)
      process.exit(1)
    })
}

export { generateOGImage, saveOGImage, generateImagesForTopCities }
