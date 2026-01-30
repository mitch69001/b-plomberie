import Link from 'next/link'
import { getRelatedCities } from '@/lib/internal-linking'
import { prisma } from '@/lib/prisma'

interface City {
  id: string
  name: string
  slug: string
  postalCode: string
  department: string
  region: string
}

interface InternalLinksProps {
  currentCity: City
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export default async function InternalLinks({ currentCity }: InternalLinksProps) {
  const relatedCities = await getRelatedCities(currentCity.id, 12)
  
  // Récupérer les slugs réels du département et de la région
  const department = await prisma.department.findFirst({
    where: {
      OR: [
        { name: currentCity.department },
        { slug: slugify(currentCity.department) },
      ],
    },
    select: { slug: true },
  })
  
  const region = await prisma.region.findFirst({
    where: {
      OR: [
        { name: currentCity.region },
        { slug: slugify(currentCity.region) },
      ],
    },
    select: { slug: true },
  })

  if (relatedCities.length === 0) {
    return null
  }

  // Sélectionner 3-4 villes aléatoires pour les liens in-text
  const citiesForInText = relatedCities.slice(0, 4)

  return (
    <section className="mb-16">
      {/* Texte contextuel avec liens naturels in-text */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
          Si vous recherchez un <strong>installateur de panneaux photovoltaïques</strong> qualifié dans le département <strong>{currentCity.department}</strong>, 
          notre réseau couvre l'ensemble de la région <strong>{currentCity.region}</strong>. 
          En complément des professionnels disponibles à <strong>{currentCity.name}</strong>, vous pouvez également consulter nos installateurs certifiés RGE 
          {citiesForInText.length > 0 && (
            <>
              {' '}à{' '}
              {citiesForInText.map((item, idx) => (
                <span key={item.city.id}>
                  <Link href={`/photovoltaique/${item.city.slug}`} className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    {item.city.name}
                  </Link>
                  {idx < citiesForInText.length - 2 && ', '}
                  {idx === citiesForInText.length - 2 && ' et '}
                </span>
              ))}
            </>
          )}
          {'. '}
          Cette proximité géographique vous permet de comparer facilement les <strong>devis d'installation de panneaux solaires</strong> et de choisir le professionnel 
          qui correspond le mieux à votre projet photovoltaïque et à votre budget.
        </p>
      </div>

      <h2 className="text-3xl font-bold mb-8">
        Villes à proximité de {currentCity.name}
      </h2>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedCities.map(({ city, reason, distance }) => (
            <Link
              key={city.id}
              href={`/photovoltaique/${city.slug}`}
              className="group p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                    {city.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {city.postalCode} - {city.department}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reason}
                    {distance && ` • ${distance} km`}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Links département et région */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center">
            {department && (
              <Link
                href={`/photovoltaique/departement/${department.slug}`}
                className="inline-flex items-center px-6 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-semibold transition-all border border-primary-200"
              >
                📍 Tous les installateurs du {currentCity.department}
              </Link>
            )}
            {region && (
              <Link
                href={`/photovoltaique/region/${region.slug}`}
                className="inline-flex items-center px-6 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-semibold transition-all border border-orange-200"
              >
                🗺️ Toute la région {currentCity.region}
              </Link>
            )}
          </div>
        </div>

        {/* Link vers la page principale */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/photovoltaique"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg"
          >
            Voir toutes les villes de France
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
