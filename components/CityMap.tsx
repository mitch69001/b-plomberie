'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet dans Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

interface CityMapProps {
  businesses: Business[]
  cityName: string
  centerLat: number
  centerLng: number
}

export default function CityMap({ businesses, cityName, centerLat, centerLng }: CityMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialiser la carte
    const map = L.map(containerRef.current).setView([centerLat, centerLng], 12)
    mapRef.current = map

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Créer une icône personnalisée orange
    const customIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
          <path fill="#f97316" stroke="#fff" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/>
          <circle cx="12" cy="9" r="3" fill="#fff"/>
        </svg>
      `),
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48],
    })

    // Ajouter les markers pour chaque installateur
    const markers: L.Marker[] = []
    
    businesses.forEach((business) => {
      if (business.latitude && business.longitude) {
        const marker = L.marker([business.latitude, business.longitude], {
          icon: customIcon,
        }).addTo(map)

        // Popup avec les infos
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; color: #f97316; margin: 0 0 8px 0; font-size: 14px;">
              ${business.name}
            </h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              📍 ${business.address}
            </p>
            ${business.phone ? `
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                📞 <a href="tel:${business.phone}" style="color: #f97316; text-decoration: none;">${business.phone}</a>
              </p>
            ` : ''}
            ${business.rating ? `
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                ⭐ ${business.rating}/5 ${business.reviewCount ? `(${business.reviewCount} avis)` : ''}
              </p>
            ` : ''}
          </div>
        `

        marker.bindPopup(popupContent)
        markers.push(marker)
      }
    })

    // Ajuster la vue pour inclure tous les markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [businesses, cityName, centerLat, centerLng])

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
