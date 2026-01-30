'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  projectType: string
  message: string | null
  budget: string | null
  surface: number | null
  status: string
  createdAt: string
  city: {
    name: string
    slug: string
  }
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads')
      const data = await res.json()
      setLeads(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchLeads()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return

    try {
      await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
      setSelectedLead(null)
      fetchLeads()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'Nom', 'Email', 'Téléphone', 'Ville', 'Type', 'Budget', 'Surface', 'Statut']
    const rows = filteredLeads.map(lead => [
      new Date(lead.createdAt).toLocaleDateString('fr-FR'),
      lead.name,
      lead.email,
      lead.phone,
      lead.city.name,
      lead.projectType,
      lead.budget || '',
      lead.surface?.toString() || '',
      lead.status
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLeads = leads.filter((lead) => {
    const matchSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.city.name.toLowerCase().includes(search.toLowerCase())
    
    if (!matchSearch) return false

    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    return true
  })

  const statusColors: Record<string, string> = {
    'nouveau': 'bg-blue-100 text-blue-800',
    'contacté': 'bg-yellow-100 text-yellow-800',
    'qualifié': 'bg-purple-100 text-purple-800',
    'converti': 'bg-green-100 text-green-800',
    'perdu': 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des leads</h1>
          <p className="mt-2 text-gray-600">
            {leads.length} lead{leads.length > 1 ? 's' : ''} • {filteredLeads.length} affiché{filteredLeads.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filteredLeads.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Exporter CSV
        </button>
      </div>

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
              placeholder="Nom, email, ville..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="nouveau">Nouveau</option>
              <option value="contacté">Contacté</option>
              <option value="qualifié">Qualifié</option>
              <option value="converti">Converti</option>
              <option value="perdu">Perdu</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.city.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.projectType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLead(lead)
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Aucun lead trouvé</p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Détails du lead</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nom</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ville</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.city.name}</dd>
                  </div>
                </dl>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Projet</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.projectType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.budget || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Surface</dt>
                    <dd className="text-sm text-gray-900">{selectedLead.surface ? `${selectedLead.surface} m²` : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(selectedLead.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedLead.createdAt).toLocaleTimeString('fr-FR')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Message</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Statut</h3>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    updateStatus(selectedLead.id, e.target.value)
                    setSelectedLead({ ...selectedLead, status: e.target.value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="contacté">Contacté</option>
                  <option value="qualifié">Qualifié</option>
                  <option value="converti">Converti</option>
                  <option value="perdu">Perdu</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => deleteLead(selectedLead.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
