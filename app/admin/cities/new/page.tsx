'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RegionData {
  regions: string[]
  departments: Record<string, string[]> // region -> departments
}

export default function NewCity() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regionData, setRegionData] = useState<RegionData>({ regions: [], departments: {} })

  const [formData, setFormData] = useState({
    name: '',
    postalCode: '',
    department: '',
    region: '',
    population: '',
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    fetchRegionData()
  }, [])

  const fetchRegionData = async () => {
    try {
      const res = await fetch('/api/admin/cities/regions')
      const data = await res.json()
      setRegionData(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/cities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          population: formData.population ? parseInt(formData.population) : null,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.push('/admin/cities')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const availableDepartments = formData.region 
    ? regionData.departments[formData.region] || []
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/cities" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Ajouter une ville</h1>
        <p className="mt-2 text-gray-600">
          Créez une nouvelle fiche ville pour votre plateforme
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Nom de la ville <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Paris"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Slug auto-généré : {generateSlug(formData.name) || '...'}
              </p>
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-900 mb-2">
                Code postal <span className="text-red-600">*</span>
              </label>
              <input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="75001"
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="population" className="block text-sm font-medium text-gray-900 mb-2">
                Population
              </label>
              <input
                id="population"
                type="number"
                value={formData.population}
                onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                placeholder="2165423"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Localisation administrative</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-900 mb-2">
                Région <span className="text-red-600">*</span>
              </label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value, department: '' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner une région</option>
                {regionData.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-900 mb-2">
                Département <span className="text-red-600">*</span>
              </label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={!formData.region}
              >
                <option value="">Sélectionner un département</option>
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {!formData.region && (
                <p className="mt-1 text-xs text-gray-500">Sélectionnez d'abord une région</p>
              )}
            </div>
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Coordonnées GPS</h2>
          <p className="text-sm text-gray-600 mb-4">
            Utilisez <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">LatLong.net</a> pour trouver les coordonnées
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-900 mb-2">
                Latitude <span className="text-red-600">*</span>
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="48.8566"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-900 mb-2">
                Longitude <span className="text-red-600">*</span>
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="2.3522"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/cities"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer la ville'}
          </button>
        </div>
      </form>
    </div>
  )
}
