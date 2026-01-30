'use client'

import { useState } from 'react'

interface City {
  id: string
  name: string
  postalCode: string
}

interface LeadFormProps {
  city: City
}

export default function LeadForm({ city }: LeadFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    projectType: '',
    surface: '',
    budget: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cityId: city.id,
          postalCode: city.postalCode,
        }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.')
      }
    } catch (error) {
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
        <p className="text-gray-600">
          Merci pour votre demande. Un installateur partenaire vous contactera sous 24h.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
          1
        </div>
        <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
          2
        </div>
        <div className={`w-24 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
          3
        </div>
      </div>

      {/* Step 1: Project Info */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Votre projet</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de projet *
            </label>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              <option value="installation">Nouvelle installation</option>
              <option value="renovation">Rénovation</option>
              <option value="maintenance">Maintenance</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface disponible (m²)
            </label>
            <input
              type="number"
              name="surface"
              value={formData.surface}
              onChange={handleChange}
              placeholder="Ex: 30"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget approximatif
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              <option value="moins-10k">Moins de 10 000 €</option>
              <option value="10-15k">10 000 - 15 000 €</option>
              <option value="15-20k">15 000 - 20 000 €</option>
              <option value="plus-20k">Plus de 20 000 €</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!formData.projectType}
            className="w-full px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Vos coordonnées</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Jean Dupont"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jean.dupont@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!formData.name || !formData.email || !formData.phone}
              className="flex-1 px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Message & Validation */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Message (optionnel)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Détails supplémentaires
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Parlez-nous de votre projet..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
              En soumettant ce formulaire, vous acceptez d'être contacté par nos installateurs partenaires.
              Vos données sont traitées conformément à notre politique de confidentialité.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
