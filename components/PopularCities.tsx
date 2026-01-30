import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function PopularCities() {
  // Récupérer les villes les plus populaires (avec le plus d'entreprises)
  const cities = await prisma.city.findMany({
    where: {
      population: {
        gte: 50000, // Grandes villes
      },
    },
    include: {
      _count: {
        select: {
          businesses: true,
        },
      },
    },
    orderBy: [
      {
        population: 'desc',
      },
    ],
    take: 30,
  })

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Installation de panneaux solaires par ville
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos installateurs de panneaux photovoltaïques certifiés RGE dans les principales villes de France. 
            Comparez les devis et trouvez le meilleur professionnel près de chez vous.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/photovoltaique/${city.slug}`}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary-50 hover:to-orange-50 rounded-lg p-6 transition-all hover:shadow-lg border border-gray-200 hover:border-primary-400"
            >
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 mb-2 transition-colors">
                  {city.name}
                </h3>
                {city._count.businesses > 0 && (
                  <div className="inline-flex items-center text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                    <svg className="w-3 h-3 mr-1 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    {city._count.businesses} pro{city._count.businesses > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA pour voir toutes les villes */}
        <div className="mt-12 text-center">
          <Link
            href="/photovoltaique"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Voir toutes les villes
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
