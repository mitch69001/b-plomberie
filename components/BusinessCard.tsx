'use client'

interface Business {
  id: string
  name: string
  address: string
  postalCode: string
  phone?: string | null
  website?: string | null
  rating?: number | null
  reviewCount?: number | null
  services?: string | null // Stored as comma-separated string for SQLite compatibility
}

interface BusinessCardProps {
  business: Business
}

export default function BusinessCard({ business }: BusinessCardProps) {
  // Convertir services string en array
  const services = business.services ? business.services.split(',').filter(s => s.trim()) : []
  
  // Handler pour scroller vers le formulaire
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault()
    const form = document.getElementById('devis')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex-1">{business.name}</h3>
        {business.rating && (
          <div className="flex items-center ml-4">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-semibold text-gray-700">
              {business.rating.toFixed(1)}
            </span>
            {business.reviewCount && (
              <span className="ml-1 text-sm text-gray-500">
                ({business.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start text-gray-600">
          <svg
            className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <div className="text-sm">{business.address}</div>
            <div className="text-sm">{business.postalCode}</div>
          </div>
        </div>

        {business.phone && (
          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <a href={`tel:${business.phone}`} className="text-sm hover:text-primary-600">
              {business.phone}
            </a>
          </div>
        )}
      </div>

      {services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {services.slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={scrollToForm}
          className="block w-full text-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
        >
          Demander un devis
        </button>
      </div>
    </div>
  )
}
