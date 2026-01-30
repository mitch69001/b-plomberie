'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Region {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  _count: {
    departments: number
  }
}

export default function RegionsAdmin() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/admin/regions')
      const data = await res.json()
      setRegions(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRegion 
        ? `/api/admin/regions/${editingRegion.id}`
        : '/api/admin/regions'
      
      const res = await fetch(url, {
        method: editingRegion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', description: '' })
        setEditingRegion(null)
        fetchRegions()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const deleteRegion = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette région ?')) return

    try {
      await fetch(`/api/admin/regions/${id}`, { method: 'DELETE' })
      fetchRegions()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const openModal = (region?: Region) => {
    if (region) {
      setEditingRegion(region)
      setFormData({
        name: region.name,
        description: region.description || ''
      })
    } else {
      setEditingRegion(null)
      setFormData({ name: '', description: '' })
    }
    setShowModal(true)
  }

  const filteredRegions = regions.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des régions</h1>
          <p className="mt-2 text-gray-600">
            {regions.length} région{regions.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Ajouter une région
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une région..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{region.name}</h3>
                {region.description && (
                  <p className="text-sm text-gray-600 mt-1">{region.description}</p>
                )}
              </div>
              {region.active && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Actif
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {region._count.departments} département{region._count.departments > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(region)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Éditer
                </button>
                <button
                  onClick={() => deleteRegion(region.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRegions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Aucune région trouvée</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingRegion ? 'Éditer' : 'Ajouter'} une région
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom de la région <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Île-de-France"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la région..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRegion(null)
                    setFormData({ name: '', description: '' })
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingRegion ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
