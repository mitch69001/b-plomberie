import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://b-photovoltaique.fr'

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/photovoltaique`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Tenter de récupérer les données de la base de données
  // Si la BDD n'est pas disponible (premier déploiement), retourner uniquement les pages statiques
  try {
    // Récupérer toutes les villes
    const cities = await prisma.city.findMany({
      select: {
        slug: true,
        updatedAt: true,
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Pages villes
    const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${baseUrl}/photovoltaique/${city.slug}`,
      lastModified: city.updatedAt,
      changeFrequency: 'weekly',
      priority: city._count.businesses > 0 ? 0.8 : 0.6,
    }))

    // Récupérer les départements
    const departments = await prisma.department.findMany({
      where: {
        active: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Pages départements
    const departmentPages: MetadataRoute.Sitemap = departments.map((dept) => ({
      url: `${baseUrl}/photovoltaique/departement/${dept.slug}`,
      lastModified: dept.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Récupérer les régions
    const regions = await prisma.region.findMany({
      where: {
        active: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Pages régions
    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${baseUrl}/photovoltaique/region/${region.slug}`,
      lastModified: region.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...cityPages, ...departmentPages, ...regionPages]
  } catch (error) {
    // Si la base de données n'est pas disponible, retourner uniquement les pages statiques
    console.warn('Database not available for sitemap generation, returning static pages only')
    return staticPages
  }
}
