import Breadcrumb from './Breadcrumb'

interface City {
  name: string
  slug: string
  postalCode: string
  department: string
  region: string
  population?: number | null
}

interface ContentTemplate {
  intro: string
  benefits: string[]
  faq: Array<{ question: string; answer: string }>
}

interface CityHeroProps {
  city: City
  h1: string
  content: ContentTemplate
}

export default function CityHero({ city, h1, content }: CityHeroProps) {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Photovoltaïque', href: '/photovoltaique' },
    { label: city.name }
  ]

  return (
    <div className="bg-gradient-to-br from-primary-600 to-orange-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {h1}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-50 max-w-3xl mx-auto">
            Trouvez les meilleurs installateurs certifiés RGE près de chez vous
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#devis"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Demander un devis gratuit
            </a>
            <a
              href="#installateurs"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors border-2 border-white"
            >
              Voir les installateurs
            </a>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-primary-100">Certifiés RGE</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">Gratuit</div>
            <div className="text-primary-100">Sans engagement</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24h</div>
            <div className="text-primary-100">Réponse rapide</div>
          </div>
        </div>
      </div>
    </div>
  )
}
