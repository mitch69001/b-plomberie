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
  
  const department = await prisma.department.findUnique({
    where: { slug },
  })

  if (!department) {
    return {
      title: 'Département non trouvé',
    }
  }
  
  // Compter les villes du département
  const cityCount = await prisma.city.count({
    where: {
      department: department.name,
    },
  })

  const title = `Installateurs Panneaux Solaires ${department.name} (${department.code}) - Devis Gratuit`
  const description = `Trouvez les meilleurs installateurs de panneaux photovoltaïques certifiés RGE dans le ${department.name} (${department.code}). ${cityCount} villes disponibles. Devis gratuit et sans engagement.`

  return {
    title,
    description,
    keywords: `panneaux solaires ${department.name}, photovoltaïque ${department.code}, installateur RGE ${department.name}, devis panneaux solaires ${department.name}`,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/photovoltaique/departement/${department.slug}`,
    },
  }
}

// Génération statique des pages
export async function generateStaticParams() {
  const departments = await prisma.department.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
    },
  })

  return departments.map((dept) => ({
    slug: dept.slug,
  }))
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params
  
  const department = await prisma.department.findUnique({
    where: { slug },
  })

  if (!department) {
    notFound()
  }
  
  // Récupérer les villes de ce département
  const cities = await prisma.city.findMany({
    where: {
      department: department.name,
    },
    include: {
      _count: {
        select: { businesses: true },
      },
    },
    orderBy: [
      { population: 'desc' },
      { name: 'asc' },
    ],
  })

  // Compter le nombre total d'installateurs dans le département
  const totalBusinesses = cities.reduce(
    (sum, city) => sum + city._count.businesses,
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
              <li className="text-white font-medium">{department.name}</li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Installateurs Panneaux Solaires {department.name} ({department.code})
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Trouvez les meilleurs professionnels certifiés RGE dans le {department.name}. 
            {totalBusinesses > 0 && ` ${totalBusinesses} installateurs référencés dans ${cities.length} villes.`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg max-w-none">
            <h2>Installation de panneaux solaires dans le {department.name}</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Le département du {department.name} ({department.code}) offre un excellent potentiel pour 
              l'installation de panneaux photovoltaïques. Que vous soyez particulier ou professionnel, 
              découvrez nos installateurs certifiés RGE pour votre projet solaire.
            </p>
            
            <h3>Pourquoi installer des panneaux solaires dans le {department.name} ?</h3>
            <ul>
              <li><strong>Économies d'énergie :</strong> Réduisez votre facture d'électricité jusqu'à 70%</li>
              <li><strong>Aides financières :</strong> Profitez des subventions locales et nationales</li>
              <li><strong>Plus-value immobilière :</strong> Augmentez la valeur de votre bien</li>
              <li><strong>Transition écologique :</strong> Participez à la protection de l'environnement</li>
            </ul>

            <h3>Les installateurs RGE du {department.name}</h3>
            <p>
              Tous nos installateurs partenaires dans le {department.name} sont certifiés RGE 
              (Reconnu Garant de l'Environnement). Cette certification est indispensable pour 
              bénéficier des aides de l'État et garantit un travail de qualité selon les normes 
              en vigueur.
            </p>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Villes du {department.name} ({department.code})
          </h2>
          
          {cities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/photovoltaique/${city.slug}`}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group"
                >
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    {city.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>📮 {city.postalCode}</span>
                    {city._count.businesses > 0 && (
                      <span className="text-primary-600 font-medium">
                        {city._count.businesses} installateur{city._count.businesses > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                Nous mettons à jour régulièrement notre liste de villes. Revenez bientôt pour
                découvrir les professionnels du {department.name}.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Besoin d'un installateur dans le {department.name} ?
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Comparez gratuitement jusqu'à 3 devis d'installateurs certifiés RGE
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

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">
            Questions fréquentes sur les panneaux solaires dans le {department.name}
          </h2>
          <div className="space-y-6">
            <details className="bg-white rounded-lg shadow-md border border-gray-200 p-6 group">
              <summary className="font-bold text-lg cursor-pointer text-gray-900 group-hover:text-primary-600">
                Quelle est la rentabilité des panneaux solaires dans le {department.name} ?
              </summary>
              <p className="mt-4 text-gray-700">
                Dans le {department.name}, une installation photovoltaïque bien dimensionnée peut être amortie 
                en 8 à 12 ans. Avec une durée de vie de 25 à 30 ans, vous pouvez donc profiter de 15 à 20 ans 
                d'électricité gratuite !
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md border border-gray-200 p-6 group">
              <summary className="font-bold text-lg cursor-pointer text-gray-900 group-hover:text-primary-600">
                Quelles sont les aides disponibles dans le {department.name} ?
              </summary>
              <p className="mt-4 text-gray-700">
                Vous pouvez bénéficier de la prime à l'autoconsommation, du taux de TVA réduit à 10%, 
                et potentiellement d'aides locales spécifiques au {department.name}. Un installateur RGE 
                vous guidera pour maximiser ces aides.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md border border-gray-200 p-6 group">
              <summary className="font-bold text-lg cursor-pointer text-gray-900 group-hover:text-primary-600">
                Combien de temps dure l'installation ?
              </summary>
              <p className="mt-4 text-gray-700">
                L'installation de panneaux solaires dure généralement 1 à 3 jours pour une maison individuelle, 
                selon la complexité du projet. Les démarches administratives peuvent prendre quelques semaines 
                supplémentaires.
              </p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
