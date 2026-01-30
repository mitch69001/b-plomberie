'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface RalfyStatus {
  status: string
  balance?: number
}

export default function IndexationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [ralfyStatus, setRalfyStatus] = useState<RalfyStatus | null>(null)
  const [selectedType, setSelectedType] = useState<'cities' | 'departments' | 'regions' | 'pages'>('cities')
  const [urls, setUrls] = useState<string>('')
  const [projectName, setProjectName] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const [statusRes, balanceRes] = await Promise.all([
        fetch('/api/admin/ralfy-index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status' }),
        }),
        fetch('/api/admin/ralfy-index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'balance' }),
        }),
      ])

      const statusData = await statusRes.json()
      const balanceData = await balanceRes.json()

      setRalfyStatus({
        status: statusData.status,
        balance: balanceData.balance,
      })
    } catch (err) {
      console.error('Erreur lors de la récupération du statut:', err)
    }
  }

  const generateUrls = async () => {
    setLoading(true)
    setError(null)

    try {
      let generatedUrls: string[] = []
      const baseUrl = 'https://www.b-photovoltaique.fr'

      if (selectedType === 'cities') {
        const res = await fetch('/api/cities')
        const cities = await res.json()
        generatedUrls = cities.map((city: any) => `${baseUrl}/photovoltaique/${city.slug}`)
      } else if (selectedType === 'departments') {
        const res = await fetch('/api/departments')
        const departments = await res.json()
        generatedUrls = departments.map((dept: any) => `${baseUrl}/photovoltaique/departement/${dept.slug}`)
      } else if (selectedType === 'regions') {
        const res = await fetch('/api/regions')
        const regions = await res.json()
        generatedUrls = regions.map((region: any) => `${baseUrl}/photovoltaique/region/${region.slug}`)
      } else if (selectedType === 'pages') {
        const res = await fetch('/api/admin/pages')
        const pages = await res.json()
        generatedUrls = pages
          .filter((page: any) => page.published)
          .map((page: any) => `${baseUrl}/${page.slug}`)
      }

      setUrls(generatedUrls.join('\n'))
    } catch (err) {
      setError('Erreur lors de la génération des URLs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const submitUrls = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const urlArray = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (urlArray.length === 0) {
        setError('Aucune URL à soumettre')
        return
      }

      const res = await fetch('/api/admin/ralfy-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          projectName: projectName || `Indexation_${new Date().toISOString().split('T')[0]}`,
          urls: urlArray,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la soumission')
      } else {
        setResult(data)
        setUrls('')
        setProjectName('')
        fetchStatus() // Rafraîchir le solde
      }
    } catch (err) {
      setError('Erreur réseau')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Indexation Google</h1>
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {/* Status et Balance */}
      {ralfyStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Statut API</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ralfyStatus.status === 'ok' ? '✅ Opérationnel' : '❌ Hors ligne'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crédits disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ralfyStatus.balance !== undefined ? ralfyStatus.balance.toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Générateur d'URLs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Générer des URLs</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de pages
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="cities">🏙️ Toutes les villes</option>
              <option value="departments">📍 Tous les départements</option>
              <option value="regions">🗺️ Toutes les régions</option>
              <option value="pages">📄 Pages statiques publiées</option>
            </select>
          </div>

          <button
            onClick={generateUrls}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Génération...' : '⚡ Générer les URLs'}
          </button>
        </div>
      </div>

      {/* Formulaire de soumission */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Soumettre à l'indexation</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet (optionnel)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Indexation_Villes_Janvier_2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URLs (une par ligne)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={10}
              placeholder="https://www.b-photovoltaique.fr/photovoltaique/paris&#10;https://www.b-photovoltaique.fr/photovoltaique/lyon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              {urls.split('\n').filter(url => url.trim()).length} URL(s) à soumettre
            </p>
          </div>

          <button
            onClick={submitUrls}
            disabled={loading || !urls.trim()}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Soumission en cours...' : '🚀 Soumettre à Google'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800 font-semibold">❌ {error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-800 font-semibold">
            ✅ Succès ! {result.creditsUsed} crédit(s) utilisé(s)
          </p>
        </div>
      )}
    </div>
  )
}
