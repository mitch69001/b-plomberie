'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function BulkCitiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [citiesText, setCitiesText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)

  if (status === 'loading') {
    return <div className="p-8">Chargement...</div>
  }

  if (!session) {
    router.push('/admin')
    return null
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Parser la liste de villes (une par ligne)
    const cities = citiesText
      .split('\n')
      .map((city) => city.trim())
      .filter((city) => city.length > 0)

    if (cities.length === 0) {
      alert('Veuillez entrer au moins une ville')
      return
    }

    setIsProcessing(true)
    setLogs([])
    setResults(null)

    addLog(`🚀 Démarrage du traitement de ${cities.length} ville(s)...`)

    try {
      const response = await fetch('/api/admin/bulk-cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cities }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors du traitement')
      }

      const data = await response.json()

      addLog(`✅ Traitement terminé !`)
      addLog(`   ✓ ${data.results.success.length} villes ajoutées avec succès`)
      addLog(`   ✗ ${data.results.failed.length} échecs`)
      addLog(`   📊 ${data.results.businesses} entreprises trouvées au total`)

      if (data.results.failed.length > 0) {
        addLog('\n❌ Échecs :')
        data.results.failed.forEach((fail: any) => {
          addLog(`   - ${fail.city}: ${fail.reason}`)
        })
      }

      setResults(data.results)
    } catch (error) {
      addLog(`❌ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajout en masse de villes
          </h1>
          <p className="text-gray-600">
            Ajoutez plusieurs villes en une seule fois avec scraping automatique des entreprises
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="cities"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Liste des villes (une par ligne)
              </label>
              <textarea
                id="cities"
                value={citiesText}
                onChange={(e) => setCitiesText(e.target.value)}
                placeholder="Exemple :&#10;Annecy&#10;Chambéry&#10;Grenoble&#10;Valence&#10;Lyon"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="mt-2 text-sm text-gray-500">
                {citiesText.split('\n').filter((c) => c.trim()).length} ville(s)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Fonctionnement
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Détection automatique de la région et du département</li>
                <li>✓ Création de la ville en base de données</li>
                <li>✓ Scraping automatique avec DataForSEO (7 mots-clés testés)</li>
                <li>✓ Enregistrement des entreprises trouvées</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ Important
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Le traitement peut prendre plusieurs minutes (délais entre les requêtes)</li>
                <li>• Environ 30 secondes par ville en moyenne</li>
                <li>• Ne fermez pas cette page pendant le traitement</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isProcessing || citiesText.trim().length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing || citiesText.trim().length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '⏳ Traitement en cours...' : '🚀 Lancer le traitement'}
            </button>
          </form>
        </div>

        {/* Zone de logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-4">📋 Journal</h2>
            <div className="bg-black rounded p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {isProcessing && (
                <div className="mt-4 text-yellow-400 animate-pulse">
                  ⏳ Traitement en cours...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Résumé final */}
        {results && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Résumé</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {results.success.length}
                </div>
                <div className="text-sm text-green-700">Villes ajoutées</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {results.failed.length}
                </div>
                <div className="text-sm text-red-700">Échecs</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {results.businesses}
                </div>
                <div className="text-sm text-blue-700">Entreprises trouvées</div>
              </div>
            </div>

            {results.success.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">✅ Villes ajoutées :</h3>
                <div className="flex flex-wrap gap-2">
                  {results.success.map((city: string, index: number) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.failed.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">❌ Échecs :</h3>
                <div className="space-y-2">
                  {results.failed.map((fail: any, index: number) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded p-3"
                    >
                      <div className="font-medium text-red-900">{fail.city}</div>
                      <div className="text-sm text-red-700">{fail.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
