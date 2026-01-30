import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Breadcrumb from '@/components/Breadcrumb'
import CitySearch from '@/components/CitySearch'

// Revalidation toutes les 5 minutes (pour voir les nouvelles villes rapidement)
export const revalidate = 300

export const metadata = {
  title: 'Installateurs Panneaux Solaires par Ville | Trouvez un Pro RGE',
  description: 'Trouvez les meilleurs installateurs de panneaux photovoltaïques certifiés RGE dans plus de 35 000 villes en France. Comparez et demandez des devis gratuits.',
}

export default async function PhotovoltaiquePage() {
  // Récupérer toutes les villes (pas de filtre de population)
  const majorCities = await prisma.city.findMany({
    orderBy: [
      { population: 'desc' },
      { name: 'asc' }
    ],
    take: 100, // Augmenté pour afficher plus de villes
    include: {
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  })

  return (
    <main id="top" className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[
              { label: 'Accueil', href: '/' },
              { label: 'Photovoltaïque' }
            ]} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Installateurs de Panneaux Solaires en France
          </h1>
          <p className="text-xl text-center text-primary-50 mb-8">
            Plus de 35 000 villes référencées - Trouvez un installateur certifié RGE près de chez vous
          </p>
          
          {/* Search Bar */}
          <CitySearch />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Major Cities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Grandes villes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {majorCities.map((city) => (
              <Link
                key={city.id}
                href={`/photovoltaique/${city.slug}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary-500"
              >
                <h3 className="font-semibold text-gray-900">{city.name}</h3>
                <p className="text-sm text-gray-600">{city.department}</p>
                {city._count.businesses > 0 && (
                  <p className="text-xs text-primary-600 mt-2">
                    {city._count.businesses} installateur{city._count.businesses > 1 ? 's' : ''}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2>Pourquoi choisir un installateur de panneaux solaires certifié RGE ?</h2>
            <p>
              Le label <strong>RGE (Reconnu Garant de l'Environnement)</strong> est un gage de qualité essentiel lors du choix
              d'un installateur de panneaux photovoltaïques. Cette certification obligatoire garantit le professionnalisme 
              et l'expertise des artisans dans le domaine des énergies renouvelables.
            </p>
            
            <p>En choisissant un <strong>installateur certifié RGE</strong>, vous bénéficiez de :</p>
            <ul>
              <li><strong>Un professionnel qualifié</strong> et formé aux dernières technologies photovoltaïques</li>
              <li><strong>L'accès aux aides financières de l'État</strong> : prime à l'autoconsommation, TVA réduite à 10%, éco-prêt à taux zéro</li>
              <li><strong>Une installation conforme aux normes</strong> NF C 15-100 et aux règles de l'art</li>
              <li><strong>Une garantie décennale</strong> sur les travaux réalisés, vous protégeant pendant 10 ans</li>
              <li><strong>Un accompagnement complet</strong> dans vos démarches administratives auprès d'Enedis et de votre mairie</li>
            </ul>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 my-8">
              <p className="font-semibold text-primary-900 mb-2">⚠️ Important</p>
              <p className="text-primary-800 mb-0">
                Sans installateur RGE, vous ne pourrez pas bénéficier des aides de l'État, qui peuvent représenter 
                jusqu'à 3 000€ d'économies sur votre projet photovoltaïque. Assurez-vous toujours de vérifier la 
                certification RGE de votre artisan avant de signer un devis.
              </p>
            </div>

            <h2>Comment trouver le meilleur installateur près de chez vous ?</h2>
            <p>
              Notre plateforme référence <strong>plus de 35 000 villes en France</strong> avec des installateurs 
              locaux certifiés RGE. Trouver le bon professionnel pour votre <strong>installation de panneaux solaires</strong> 
              n'a jamais été aussi simple.
            </p>

            <h3>Notre processus en 3 étapes</h3>
            <ol>
              <li>
                <strong>Recherchez votre ville</strong> : Utilisez notre barre de recherche ou parcourez la liste 
                des villes pour trouver les installateurs près de chez vous
              </li>
              <li>
                <strong>Comparez les professionnels</strong> : Consultez les coordonnées, avis et spécialités de 
                chaque installateur RGE
              </li>
              <li>
                <strong>Demandez vos devis</strong> : Contactez directement plusieurs installateurs pour obtenir 
                des devis gratuits et sans engagement
              </li>
            </ol>

            <h3>Ce que vous pouvez faire sur notre plateforme</h3>
            <ul>
              <li>✅ Consulter la liste complète des <strong>installateurs RGE disponibles</strong> dans votre ville</li>
              <li>✅ Comparer les <strong>coordonnées et spécialités</strong> des professionnels</li>
              <li>✅ Demander <strong>plusieurs devis gratuits</strong> et sans engagement</li>
              <li>✅ Accéder aux <strong>guides et ressources</strong> pour comprendre votre projet</li>
              <li>✅ Bénéficier de <strong>conseils personnalisés</strong> pour optimiser votre installation</li>
            </ul>

            <h2>Les avantages des panneaux solaires en 2026</h2>
            <p>
              Installer des <strong>panneaux photovoltaïques</strong> chez vous, c'est faire le choix d'une énergie 
              propre, renouvelable et économique. En 2026, les technologies ont considérablement évolué, offrant 
              des rendements toujours plus performants.
            </p>

            <h3>Économies et rentabilité</h3>
            <ul>
              <li><strong>Réduction de 40 à 70%</strong> de votre facture d'électricité</li>
              <li><strong>Retour sur investissement</strong> en 10 à 15 ans selon votre installation</li>
              <li><strong>Revente du surplus</strong> à EDF OA à tarif garanti pendant 20 ans</li>
              <li><strong>Valorisation de votre bien</strong> immobilier de 15 à 20%</li>
            </ul>

            <h3>Impact environnemental</h3>
            <ul>
              <li>🌱 Réduction de votre <strong>empreinte carbone</strong></li>
              <li>🌱 Production d'<strong>énergie verte et locale</strong></li>
              <li>🌱 Contribution aux <strong>objectifs climatiques</strong> de la France</li>
              <li>🌱 <strong>Indépendance énergétique</strong> face à la hausse des prix de l'électricité</li>
            </ul>

            <div className="bg-gradient-to-r from-primary-600 to-orange-600 text-white rounded-xl p-8 my-8 text-center">
              <h3 className="text-white text-2xl font-bold mb-4">Prêt à passer à l'énergie solaire ?</h3>
              <p className="text-primary-100 mb-6 text-lg">
                Trouvez dès maintenant les meilleurs installateurs certifiés RGE près de chez vous
              </p>
              <a
                href="#top"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg no-underline"
              >
                🚀 Commencer ma recherche
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
