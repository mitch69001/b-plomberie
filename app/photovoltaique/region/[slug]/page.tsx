import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 86400 // 24 heures

// Génération des métadonnées
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  const region = await prisma.region.findUnique({
    where: { slug },
  })

  if (!region) {
    return {
      title: 'Région non trouvée',
    }
  }
  
  // Compter les départements de la région
  const deptCount = await prisma.department.count({
    where: {
      region: {
        id: region.id,
      },
      active: true,
    },
  })

  const title = `Installateurs Panneaux Solaires ${region.name} - Devis Gratuit RGE`
  const description = `Découvrez les meilleurs installateurs de panneaux photovoltaïques certifiés RGE en ${region.name}. ${deptCount} départements couverts. Devis gratuit et comparatif.`

  return {
    title,
    description,
    keywords: `panneaux solaires ${region.name}, photovoltaïque ${region.name}, installateur RGE ${region.name}, devis panneaux solaires ${region.name}`,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/photovoltaique/region/${region.slug}`,
    },
  }
}

// Génération statique des pages
export async function generateStaticParams() {
  const regions = await prisma.region.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
    },
  })

  return regions.map((region) => ({
    slug: region.slug,
  }))
}

export default async function RegionPage({ params }: PageProps) {
  const { slug } = await params
  
  const region = await prisma.region.findUnique({
    where: { slug },
    include: {
      departments: {
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  })
  
  if (!region) {
    notFound()
  }
  
  // Compter les villes pour chaque département
  const departmentsWithCounts = await Promise.all(
    region.departments.map(async (dept) => {
      const cityCount = await prisma.city.count({
        where: {
          department: dept.name,
        },
      })
      return {
        ...dept,
        _count: { cities: cityCount },
      }
    })
  )

  // Compter le nombre total de villes dans la région
  const totalCities = departmentsWithCounts.reduce(
    (sum, dept) => sum + dept._count.cities,
    0
  )

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2 text-primary-100">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li>/</li>
              <li><Link href="/photovoltaique" className="hover:text-white transition-colors">Photovoltaïque</Link></li>
              <li>/</li>
              <li className="text-white font-medium">{region.name}</li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Installateurs Panneaux Solaires en {region.name}
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Trouvez les meilleurs professionnels certifiés RGE en {region.name}. 
            {totalCities > 0 && ` ${totalCities} villes couvertes dans ${region.departments.length} départements.`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg max-w-none">
            <h2>L'énergie solaire en {region.name}</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              La région {region.name} bénéficie d'un excellent ensoleillement pour 
              l'installation de panneaux photovoltaïques. Avec {region.departments.length} départements 
              couverts, trouvez facilement un installateur certifié RGE près de chez vous.
            </p>
            
            <h3>Les avantages du photovoltaïque en {region.name}</h3>
            <ul>
              <li><strong>Climat favorable :</strong> La {region.name} offre des conditions idéales pour la production solaire</li>
              <li><strong>Réseau d'installateurs :</strong> De nombreux professionnels RGE dans toute la région</li>
              <li><strong>Aides régionales :</strong> Profitez des dispositifs de soutien locaux</li>
              <li><strong>Expertise locale :</strong> Des installateurs qui connaissent les spécificités de {region.name}</li>
            </ul>

            <h3>Comment choisir son installateur en {region.name} ?</h3>
            <p>
              Pour votre projet photovoltaïque en {region.name}, privilégiez un installateur certifié RGE 
              (Reconnu Garant de l'Environnement). Cette certification est obligatoire pour bénéficier 
              des aides de l'État et garantit un travail conforme aux normes.
            </p>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Départements en {region.name}
          </h2>
          
          {departmentsWithCounts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentsWithCounts.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/photovoltaique/departement/${dept.slug}`}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group"
                >
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    {dept.name} ({dept.code})
                  </h3>
                  {dept._count.cities > 0 && (
                    <p className="text-gray-600">
                      {dept._count.cities} ville{dept._count.cities > 1 ? 's' : ''} disponible{dept._count.cities > 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-primary-600 font-medium">
                    Voir les installateurs
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                Nous mettons à jour régulièrement notre liste de départements. Revenez bientôt.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Projet solaire en {region.name} ?
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Recevez jusqu'à 3 devis gratuits d'installateurs RGE de votre région
          </p>
          <div className="text-center">
            <Link
              href="/photovoltaique#devis"
              className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              Demander un devis gratuit
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">
            Pourquoi installer des panneaux solaires en {region.name} ?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Économies garanties</h3>
              <p className="text-gray-700">
                Réduisez votre facture d'électricité de 40 à 70% dès la première année
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Écologie</h3>
              <p className="text-gray-700">
                Participez à la transition énergétique et réduisez votre empreinte carbone
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">Plus-value</h3>
              <p className="text-gray-700">
                Augmentez la valeur de votre bien immobilier de 15 à 20%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-2">Aides financières</h3>
              <p className="text-gray-700">
                Prime à l'autoconsommation, TVA réduite et aides locales disponibles
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
