'use client'

import { useState, useEffect } from 'react'

interface City {
  id: string
  name: string
  slug: string
  department: string
  _count: { businesses: number }
}

interface ScrapingLog {
  id: string
  cityName: string
  status: string
  itemsFound: number
  itemsSaved: number
  duration: number | null
  error: string | null
  createdAt: string
}

export default function ScrapingAdmin() {
  const [cities, setCities] = useState<City[]>([])
  const [logs, setLogs] = useState<ScrapingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [batchCount, setBatchCount] = useState(5)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [citiesRes, logsRes] = await Promise.all([
        fetch('/api/admin/cities'),
        fetch('/api/admin/scraping/logs')
      ])
      const citiesData = await citiesRes.json()
      const logsData = await logsRes.json()
      setCities(citiesData)
      setLogs(logsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async (type: 'single' | 'department' | 'batch') => {
    if (type === 'single' && !selectedCity) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une ville' })
      return
    }
    if (type === 'department' && !selectedDepartment) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un département' })
      return
    }

    setScraping(true)
    setMessage(null)

    try {
      const body: any = { type }
      if (type === 'single') body.cityId = selectedCity
      if (type === 'department') body.department = selectedDepartment
      if (type === 'batch') body.count = batchCount

      const res = await fetch('/api/admin/scraping/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Scraping terminé: ${data.saved} entreprise(s) sauvegardée(s)` })
        fetchData() // Refresh logs
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du scraping' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du scraping' })
    } finally {
      setScraping(false)
    }
  }

  const departments = Array.from(new Set(cities.map(c => c.department))).sort()

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scraping</h1>
        <p className="mt-2 text-gray-600">
          Lancez le scraping pour récupérer les données des entreprises
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Scraping Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Single City */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Scraper une ville
          </h2>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={scraping}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          >
            <option value="">Sélectionner une ville</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} ({city._count.businesses} entreprises)
              </option>
            ))}
          </select>
          <button
            onClick={() => handleScrape('single')}
            disabled={scraping || !selectedCity}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? 'Scraping...' : 'Lancer le scraping'}
          </button>
        </div>

        {/* Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Scraper un département
          </h2>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={scraping}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          >
            <option value="">Sélectionner un département</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleScrape('department')}
            disabled={scraping || !selectedDepartment}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? 'Scraping...' : 'Lancer le scraping'}
          </button>
        </div>

        {/* Batch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Scraping en lot
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de villes
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 5)}
              disabled={scraping}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleScrape('batch')}
            disabled={scraping}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? 'Scraping...' : 'Lancer le scraping'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Scrape les villes avec le moins d'entreprises
          </p>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Historique</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trouvées
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sauvegardées
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className={log.error ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>{log.cityName}</div>
                    {log.error && (
                      <div className="mt-1 text-xs text-red-600 font-normal max-w-md">
                        <span className="font-medium">⚠️ Erreur: </span>
                        {log.error}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.itemsFound}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.itemsSaved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString('fr-FR')} {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Aucun historique de scraping</p>
          </div>
        )}
      </div>
    </div>
  )
}
