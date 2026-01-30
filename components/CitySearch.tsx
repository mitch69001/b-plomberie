'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface City {
  name: string
  slug: string
  department: string
  region: string
  _count: {
    businesses: number
  }
}

export default function CitySearch() {
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fermer les suggestions si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Rechercher les villes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(search)}`)
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(`/photovoltaique/${suggestions[selectedIndex].slug}`)
    } else if (search.trim()) {
      const slug = search
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      router.push(`/photovoltaique/${slug}`)
    }
    
    setShowSuggestions(false)
  }

  const handleCityClick = (slug: string) => {
    router.push(`/photovoltaique/${slug}`)
    setShowSuggestions(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="flex gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher votre ville..."
              className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
              autoComplete="off"
            />
            <button 
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={city.slug}
              onClick={() => handleCityClick(city.slug)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{city.name}</div>
                  <div className="text-sm text-gray-600">
                    {city.department} • {city.region}
                  </div>
                </div>
                {city._count.businesses > 0 && (
                  <div className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {city._count.businesses} installateur{city._count.businesses > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
