'use client'

import dynamic from 'next/dynamic'

// Import dynamique de CityMap (client-side only)
const CityMap = dynamic(() => import('./CityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  ),
})

interface Business {
  id: string
  name: string
  address: string
  phone?: string | null
  website?: string | null
  latitude: number | null
  longitude: number | null
  rating?: number | null
  reviewCount?: number | null
}

interface CityMapWrapperProps {
  businesses: Business[]
  cityName: string
  centerLat: number
  centerLng: number
}

export default function CityMapWrapper(props: CityMapWrapperProps) {
  return <CityMap {...props} />
}
