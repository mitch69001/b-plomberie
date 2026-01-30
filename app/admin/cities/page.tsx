'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface City {
  id: string
  name: string
  slug: string
  department: string
  region: string
  population: number | null
  customTitle: string | null
  customDescription: string | null
  seoEnabled: boolean
  _count: {
    businesses: number
    leads: number
  }
}

export default function CitiesAdmin() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'with-businesses' | 'without-businesses' | 'custom-seo' | 'no-custom-seo'>('all')
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/admin/cities')
      const data = await res.json()
      setCities(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCity = async (city: City) => {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer la ville "${city.name}" ?\n\n` +
      `Cela supprimera également :\n` +
      `• ${city._count.businesses} entreprise(s)\n` +
      `• ${city._count.leads} lead(s)\n\n` +
      `Cette action est irréversible !`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/cities/${city.slug}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      const data = await res.json()
      alert(`✅ ${data.message}\n\n` +
        `${data.deletedBusinesses} entreprise(s) supprimée(s)\n` +
        `${data.deletedLeads} lead(s) supprimé(s)`)
      
      // Rafraîchir la liste
      fetchCities()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la suppression de la ville')
    }
  }

  const rescrapeSelectedCities = () => {
    if (selectedCities.length === 0) {
      alert('Veuillez sélectionner au moins une ville')
      return
    }

    // Rediriger vers la page de rescraping avec les villes sélectionnées
    const citiesParam = selectedCities.join(',')
    window.location.href = `/admin/rescrape?cities=${citiesParam}`
  }

  const toggleSelectAll = () => {
    if (selectedCities.length === filteredCities.length) {
      setSelectedCities([])
    } else {
      setSelectedCities(filteredCities.map(c => c.slug))
    }
  }

  const toggleSelectCity = (slug: string) => {
    if (selectedCities.includes(slug)) {
      setSelectedCities(selectedCities.filter(s => s !== slug))
    } else {
      setSelectedCities([...selectedCities, slug])
    }
  }

  const filteredCities = cities.filter((city) => {
    const matchSearch = city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.department.toLowerCase().includes(search.toLowerCase())
    
    if (!matchSearch) return false

    if (filter === 'with-businesses') return city._count.businesses > 0
    if (filter === 'without-businesses') return city._count.businesses === 0
    if (filter === 'custom-seo') return city.customTitle !== null || city.customDescription !== null
    if (filter === 'no-custom-seo') return city.customTitle === null && city.customDescription === null
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des villes</h1>
          <p className="mt-2 text-gray-600">
            {cities.length} ville{cities.length > 1 ? 's' : ''} • {filteredCities.length} affichée{filteredCities.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/cities/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Ajouter une ville
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom de ville, département..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Toutes les villes</option>
              <option value="with-businesses">Avec entreprises</option>
              <option value="without-businesses">❌ Sans entreprises (à scraper)</option>
              <option value="custom-seo">✓ SEO personnalisé</option>
              <option value="no-custom-seo">⚠️ SEO par défaut (à optimiser)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rescrape Button */}
      {selectedCities.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-orange-900">
              {selectedCities.length} ville(s) sélectionnée(s)
            </p>
            <p className="text-sm text-orange-700">
              Relancer le scraping pour récupérer les entreprises
            </p>
          </div>
          <button
            onClick={rescrapeSelectedCities}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            🔄 Rescraper les villes
          </button>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCities.length === filteredCities.length && filteredCities.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département / Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprises
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métadonnées SEO
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city.slug)}
                      onChange={() => toggleSelectCity(city.slug)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{city.department}</div>
                    <div className="text-sm text-gray-500">{city.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {city.population?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {city._count.businesses}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {city._count.leads}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {city.customTitle || city.customDescription ? (
                        <>
                          {city.customTitle && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 w-fit">
                              ✓ Title personnalisé
                            </span>
                          )}
                          {city.customDescription && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 w-fit">
                              ✓ Description personnalisée
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                          Par défaut
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/cities/${city.slug}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Éditer
                      </Link>
                      <Link
                        href={`/photovoltaique/${city.slug}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                        title="Voir la page publique"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deleteCity(city)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer cette ville"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune ville trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  )
}
