'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  customContent: string | null
  seoEnabled: boolean
}

export default function EditCity({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    customTitle: '',
    customDescription: '',
    customContent: '',
    seoEnabled: true
  })

  useEffect(() => {
    fetchCity()
  }, [params.slug])

  const fetchCity = async () => {
    try {
      const res = await fetch(`/api/admin/cities/${params.slug}`)
      const data = await res.json()
      setCity(data)
      setFormData({
        customTitle: data.customTitle || '',
        customDescription: data.customDescription || '',
        customContent: data.customContent || '',
        seoEnabled: data.seoEnabled
      })
    } catch (error) {
      console.error('Erreur:', error)
      setError('Impossible de charger la ville')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSuccess(false)

    try {
      const res = await fetch(`/api/admin/cities/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const resetField = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: '' }))
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

  if (!city) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Ville introuvable</h2>
        <Link href="/admin/cities" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
          ← Retour à la liste
        </Link>
      </div>
    )
  }

  const defaultTitle = `Installation Panneaux Solaires ${city.name} (${city.department}) - Devis Gratuit`
  const defaultDescription = `Trouvez les meilleurs installateurs de panneaux solaires à ${city.name}. Comparez jusqu'à 3 devis gratuits de professionnels certifiés RGE dans le ${city.department}.`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/cities" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← Retour à la liste
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🏷️ Métadonnées SEO - {city.name}</h1>
          <p className="mt-2 text-gray-600">
            {city.department} • {city.region}
            {city.population && ` • ${city.population.toLocaleString()} habitants`}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-900">
              Les champs vides utiliseront les valeurs générées automatiquement
            </span>
          </div>
        </div>
        <Link
          href={`/photovoltaique/${city.slug}`}
          target="_blank"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Voir la page →
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Modifications sauvegardées avec succès !
          </div>
        )}

        {/* SEO Enable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.seoEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, seoEnabled: e.target.checked }))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              Page activée pour le SEO
            </span>
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Si désactivée, la page ne sera pas indexée par les moteurs de recherche
          </p>
        </div>

        {/* Meta Title */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="customTitle" className="block text-sm font-medium text-gray-900">
              Meta Title (Balise Title)
            </label>
            {formData.customTitle && (
              <button
                type="button"
                onClick={() => resetField('customTitle')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <input
            id="customTitle"
            type="text"
            value={formData.customTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
            placeholder={defaultTitle}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={60}
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {formData.customTitle ? 'Personnalisé' : 'Par défaut'}: {(formData.customTitle || defaultTitle).length} caractères
            </p>
            <p className={`${(formData.customTitle || defaultTitle).length > 60 ? 'text-red-600' : 'text-green-600'}`}>
              Recommandé: 50-60 caractères
            </p>
          </div>
          {!formData.customTitle && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600"><strong>Aperçu par défaut:</strong></p>
              <p className="text-sm text-gray-900 mt-1">{defaultTitle}</p>
            </div>
          )}
        </div>

        {/* Meta Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="customDescription" className="block text-sm font-medium text-gray-900">
              Meta Description
            </label>
            {formData.customDescription && (
              <button
                type="button"
                onClick={() => resetField('customDescription')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <textarea
            id="customDescription"
            value={formData.customDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
            placeholder={defaultDescription}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={160}
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {formData.customDescription ? 'Personnalisé' : 'Par défaut'}: {(formData.customDescription || defaultDescription).length} caractères
            </p>
            <p className={`${(formData.customDescription || defaultDescription).length > 160 ? 'text-red-600' : 'text-green-600'}`}>
              Recommandé: 150-160 caractères
            </p>
          </div>
          {!formData.customDescription && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600"><strong>Aperçu par défaut:</strong></p>
              <p className="text-sm text-gray-900 mt-1">{defaultDescription}</p>
            </div>
          )}
        </div>

        {/* Custom Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="customContent" className="block text-sm font-medium text-gray-900">
              Contenu personnalisé (optionnel)
            </label>
            {formData.customContent && (
              <button
                type="button"
                onClick={() => resetField('customContent')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <textarea
            id="customContent"
            value={formData.customContent}
            onChange={(e) => setFormData(prev => ({ ...prev, customContent: e.target.value }))}
            placeholder="Ajoutez un paragraphe d'introduction personnalisé pour cette ville..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Ce contenu remplacera l'introduction automatique si renseigné
          </p>
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
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
