import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  generateCityContent,
  generateH1,
  generateMetaDescription,
  generatePageTitle,
} from '@/lib/content-generator'
import CityHero from '@/components/CityHero'
import BusinessCard from '@/components/BusinessCard'
import InternalLinks from '@/components/InternalLinks'
import JsonLdSchema from '@/components/JsonLdSchema'
import LeadForm from '@/components/LeadForm'
import CityMapWrapper from '@/components/CityMapWrapper'

interface PageProps {
  params: Promise<{ city: string }>
}

// Revalidation toutes les 24 heures (ISR)
export const revalidate = 86400

// Génération des métadonnées
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { businesses: true },
      },
    },
  })

  if (!city) {
    return {
      title: 'Ville non trouvée',
    }
  }

  const businessCount = city._count.businesses
  // Utiliser les métadonnées personnalisées si elles existent
  const title = city.customTitle || generatePageTitle(city)
  const description = city.customDescription || generateMetaDescription(city, businessCount)
  const canonical = `/photovoltaique/${city.slug}`

  return {
    title,
    description,
    keywords: `panneaux solaires ${city.name}, photovoltaïque ${city.name}, installateur RGE ${city.name}, ${city.postalCode}, ${city.department}`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Panneaux Solaires ${city.name} - Installateurs Certifiés`,
      description,
      url: canonical,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Installateurs Panneaux Solaires',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Génération statique des pages (ISR)
export async function generateStaticParams() {
  // Générer les pages pour les villes principales (population > 10000)
  const cities = await prisma.city.findMany({
    where: {
      population: {
        gte: 10000,
      },
    },
    select: {
      slug: true,
    },
    take: 1000, // Limiter pour le build initial
  })

  return cities.map((city) => ({
    city: city.slug,
  }))
}

export default async function CityPage({ params }: PageProps) {
  const { city: slug } = await params
  
  // Récupérer les données de la ville
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      businesses: {
        where: {
          scraped: true, // Afficher les entreprises scrapées
        },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ],
        take: 20,
      },
      _count: {
        select: { businesses: true },
      },
    },
  })

  if (!city) {
    notFound()
  }

  const businessCount = city._count.businesses
  const content = generateCityContent(city, businessCount)
  const h1 = generateH1(city)

  return (
    <>
      {/* JSON-LD Schema.org */}
      <JsonLdSchema city={city} businesses={city.businesses} />

      {/* Hero Section */}
      <CityHero city={city} h1={h1} content={content} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed">
              {city.customContent || content.intro}
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Pourquoi installer des panneaux solaires à {city.name} ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Business Listings */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Installateurs de panneaux solaires à {city.name}
          </h2>
          
          {/* Carte interactive */}
          {city.businesses.length > 0 && city.latitude && city.longitude && (
            <div className="mb-12">
              <CityMapWrapper 
                businesses={city.businesses.map(b => ({
                  id: b.id,
                  name: b.name,
                  address: b.address,
                  phone: b.phone,
                  website: b.website,
                  latitude: b.latitude,
                  longitude: b.longitude,
                  rating: b.rating,
                  reviewCount: b.reviewCount,
                }))}
                cityName={city.name}
                centerLat={city.latitude}
                centerLng={city.longitude}
              />
            </div>
          )}
          
          {city.businesses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {city.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                Nous mettons à jour régulièrement notre liste d'installateurs. Revenez bientôt pour
                découvrir les professionnels certifiés de {city.name}.
              </p>
            </div>
          )}
        </section>

        {/* Lead Form */}
        <section id="devis" className="mb-16 scroll-mt-20">
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Demandez votre devis gratuit
            </h2>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Recevez jusqu'à 3 devis comparatifs d'installateurs certifiés RGE à {city.name}
            </p>
            <LeadForm city={city} />
          </div>
        </section>

        {/* Local Advantages */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Les avantages du photovoltaïque à {city.name}
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{content.localAdvantagesText}</p>
          </div>
        </section>

        {/* Why RGE */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            L'importance de choisir un installateur RGE à {city.name}
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{content.whyRGEText}</p>
          </div>
        </section>

        {/* Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">
            Le processus d'installation à {city.name}
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{content.processText}</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Questions fréquentes sur les panneaux solaires à {city.name}
          </h2>
          <div className="space-y-6">
            {content.faq.map((item, index) => (
              <details
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 group"
              >
                <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                  {item.question}
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <InternalLinks currentCity={city} />
      </main>
    </>
  )
}
