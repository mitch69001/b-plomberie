import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Revalidation toutes les 5 minutes pour les stats
export const revalidate = 300

async function getStats() {
  const [
    totalCities,
    totalBusinesses,
    scrapedBusinesses,
    verifiedBusinesses,
    totalLeads,
    recentLeads,
    recentScrapingLogs
  ] = await Promise.all([
    prisma.city.count(),
    prisma.business.count(),
    prisma.business.count({ where: { scraped: true } }),
    prisma.business.count({ where: { verified: true } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { city: true }
    }),
    prisma.scrapingLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return {
    totalCities,
    totalBusinesses,
    scrapedBusinesses,
    verifiedBusinesses,
    totalLeads,
    recentLeads,
    recentScrapingLogs
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      name: 'Villes',
      value: stats.totalCities.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      name: 'Entreprises',
      value: stats.totalBusinesses.toLocaleString(),
      subtitle: `${stats.scrapedBusinesses} scrapées`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      name: 'Leads',
      value: stats.totalLeads.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-500'
    },
    {
      name: 'Vérifiées',
      value: stats.verifiedBusinesses.toLocaleString(),
      subtitle: 'Entreprises vérifiées',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Vue d'ensemble de votre plateforme de génération de pages
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <div className="text-white">{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Leads récents</h2>
            <Link
              href="/admin/leads"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.city.name} • {lead.projectType}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun lead pour le moment</p>
            )}
          </div>
        </div>

        {/* Recent Scraping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Scraping récent</h2>
            <Link
              href="/admin/scraping"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentScrapingLogs.length > 0 ? (
              stats.recentScrapingLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.cityName}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{log.itemsSaved} entreprises sauvegardées</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun scraping pour le moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-6 border border-primary-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/bulk-cities"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-orange-200"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ajout en masse</p>
              <p className="text-xs text-gray-500">Ajouter plusieurs villes</p>
            </div>
          </Link>

          <Link
            href="/admin/scraping"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Lancer un scraping</p>
              <p className="text-xs text-gray-500">Récupérer des entreprises</p>
            </div>
          </Link>

          <Link
            href="/admin/pages"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-purple-200"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gérer les pages</p>
              <p className="text-xs text-gray-500">Footer, mentions légales, etc.</p>
            </div>
          </Link>

          <Link
            href="/admin/indexation"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-green-200"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Indexation Google</p>
              <p className="text-xs text-gray-500">Forcer l'indexation de pages</p>
            </div>
          </Link>

          <Link
            href="/admin/cities"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Éditer les métadonnées</p>
              <p className="text-xs text-gray-500">Optimiser le SEO</p>
            </div>
          </Link>

          <Link
            href="/admin/businesses"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Vérifier les entreprises</p>
              <p className="text-xs text-gray-500">Valider les données</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
