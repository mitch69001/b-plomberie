'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RescrapePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const citySlugs = searchParams.get('cities')?.split(',') || []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
    }
  }, [status, router])

  useEffect(() => {
    // Auto-démarrer le rescraping si des villes sont présentes
    if (citySlugs.length > 0 && !isProcessing && logs.length === 0) {
      handleRescrape()
    }
  }, [citySlugs])

  if (status === 'loading') {
    return <div className="p-8">Chargement...</div>
  }

  if (!session) {
    return null
  }

  if (citySlugs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune ville sélectionnée
            </h1>
            <p className="text-gray-600 mb-6">
              Veuillez sélectionner des villes depuis la page de gestion.
            </p>
            <Link
              href="/admin/cities"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Retour à la gestion des villes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const handleRescrape = async () => {
    setIsProcessing(true)
    setLogs([])
    setResults(null)

    addLog(`🚀 Démarrage du rescraping de ${citySlugs.length} ville(s)...`)
    addLog(`📋 Villes sélectionnées : ${citySlugs.join(', ')}`)

    try {
      const response = await fetch('/api/admin/rescrape-cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ citySlugs }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors du rescraping')
      }

      const data = await response.json()

      addLog(`✅ Rescraping terminé !`)
      addLog(`   ✓ ${data.results.success.length} villes scrapées avec succès`)
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
          <Link
            href="/admin/cities"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Retour à la gestion des villes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rescraping des villes
          </h1>
          <p className="text-gray-600">
            {citySlugs.length} ville(s) sélectionnée(s) pour le rescraping
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ℹ️ Informations
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Le scraping teste 7 mots-clés différents par ville</li>
            <li>• Délai de 2 secondes entre chaque mot-clé (respect des limites API)</li>
            <li>• Temps estimé : ~30 secondes par ville</li>
            <li>• Ne fermez pas cette page pendant le traitement</li>
          </ul>
        </div>

        {/* Zone de logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">📋 Journal en temps réel</h2>
            <div className="bg-black rounded p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {isProcessing && (
                <div className="mt-4 text-yellow-400 animate-pulse">
                  ⏳ Scraping en cours...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Résumé final */}
        {results && !isProcessing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Résumé</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {results.success.length}
                </div>
                <div className="text-sm text-green-700">Villes scrapées</div>
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
                <h3 className="font-semibold text-gray-900 mb-2">✅ Villes scrapées :</h3>
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

            <div className="mt-6">
              <Link
                href="/admin/cities"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ← Retour à la gestion des villes
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
