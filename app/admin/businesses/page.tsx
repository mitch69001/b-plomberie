'use client'

import { useState, useEffect } from 'react'

interface Business {
  id: string
  name: string
  address: string
  postalCode: string
  phone: string | null
  email: string | null
  website: string | null
  rating: number | null
  reviewCount: number | null
  services: string | null
  scraped: boolean
  verified: boolean
  city: {
    name: string
    slug: string
  }
}

export default function BusinessesAdmin() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'scraped' | 'verified' | 'unverified'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/admin/businesses')
      const data = await res.json()
      setBusinesses(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus })
      })
      fetchBusinesses()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const deleteBusiness = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return

    try {
      await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' })
      fetchBusinesses()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const bulkAction = async (action: 'verify' | 'unverify' | 'delete') => {
    if (selectedIds.length === 0) return
    if (action === 'delete' && !confirm(`Supprimer ${selectedIds.length} entreprise(s) ?`)) return

    try {
      await fetch('/api/admin/businesses/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action })
      })
      setSelectedIds([])
      fetchBusinesses()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const filteredBusinesses = businesses.filter((business) => {
    const matchSearch = business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.city.name.toLowerCase().includes(search.toLowerCase())
    
    if (!matchSearch) return false

    if (filter === 'scraped') return business.scraped
    if (filter === 'verified') return business.verified
    if (filter === 'unverified') return !business.verified
    return true
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBusinesses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredBusinesses.map(b => b.id))
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des entreprises</h1>
          <p className="mt-2 text-gray-600">
            {businesses.length} entreprise{businesses.length > 1 ? 's' : ''} • {filteredBusinesses.length} affichée{filteredBusinesses.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-900">
              {selectedIds.length} entreprise{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => bulkAction('verify')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                Vérifier
              </button>
              <button
                onClick={() => bulkAction('unverify')}
                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
              >
                Retirer vérification
              </button>
              <button
                onClick={() => bulkAction('delete')}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom d'entreprise, ville..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
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
              <option value="all">Toutes</option>
              <option value="scraped">Scrapées</option>
              <option value="verified">Vérifiées</option>
              <option value="unverified">Non vérifiées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(business.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, business.id])
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== business.id))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{business.name}</div>
                    <div className="text-sm text-gray-500">{business.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {business.city.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{business.phone || '-'}</div>
                    <div className="text-sm text-gray-500">{business.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {business.rating ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{business.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">({business.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {business.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Vérifiée
                        </span>
                      )}
                      {business.scraped && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scrapée
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleVerify(business.id, business.verified)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      {business.verified ? 'Retirer' : 'Vérifier'}
                    </button>
                    <button
                      onClick={() => deleteBusiness(business.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
