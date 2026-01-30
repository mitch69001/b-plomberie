import Link from 'next/link'
import CitySearch from '@/components/CitySearch'
import PopularCities from '@/components/PopularCities'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-orange-500 to-orange-600 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-semibold">Plus de 35 000 villes référencées</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Trouvez le meilleur installateur de 
                <span className="text-yellow-300"> panneaux solaires</span> près de chez vous
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-100 mb-8">
                Comparez gratuitement les installateurs certifiés RGE dans toute la France et recevez jusqu'à 3 devis.
              </p>
              
              {/* City Search */}
              <div className="mb-8">
                <CitySearch />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/photovoltaique"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-600 bg-white rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                >
                  🔍 Trouver mon installateur
                </Link>
                <a
                  href="#comment-ca-marche"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all border-2 border-white"
                >
                  ℹ️ Comment ça marche ?
                </a>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Pros certifiés RGE</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Visual/Stats */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Stats cards */}
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                    <div className="text-5xl font-bold mb-2">35 000+</div>
                    <div className="text-primary-100 text-lg">Villes référencées</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 ml-12">
                    <div className="text-5xl font-bold mb-2">100%</div>
                    <div className="text-primary-100 text-lg">Installateurs certifiés RGE</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                    <div className="text-5xl font-bold mb-2">Gratuit</div>
                    <div className="text-primary-100 text-lg">Comparaison et devis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              3 étapes simples pour trouver votre installateur idéal
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 border-2 border-primary-200 hover:border-primary-400 transition-all">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🔍 Recherchez votre ville
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Entrez le nom de votre ville parmi les 35 000+ communes référencées en France.
                </p>
              </div>
            </div>
            
            {/* Étape 2 */}
            <div className="relative md:top-8">
              <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 border-2 border-primary-200 hover:border-primary-400 transition-all">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📋 Comparez les pros
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Consultez la liste des installateurs certifiés RGE près de chez vous avec leurs avis.
                </p>
              </div>
            </div>
            
            {/* Étape 3 */}
            <div className="relative md:top-16">
              <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 border-2 border-primary-200 hover:border-primary-400 transition-all">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ✅ Recevez vos devis
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Demandez jusqu'à 3 devis gratuits et sans engagement. Comparez et choisissez !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi passer au solaire ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Investissez dans l'avenir avec l'énergie solaire
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '💰',
                title: 'Économies',
                description: 'Jusqu\'à 50% de réduction sur votre facture d\'électricité'
              },
              {
                icon: '🌍',
                title: 'Écologique',
                description: 'Réduisez votre empreinte carbone et protégez la planète'
              },
              {
                icon: '🏠',
                title: 'Valorisation',
                description: 'Augmentez la valeur de votre bien immobilier'
              },
              {
                icon: '🎁',
                title: 'Aides financières',
                description: 'Profitez des primes et subventions de l\'État'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grandes villes - Section SEO optimisée */}
      <PopularCities />

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur l'installation de panneaux solaires
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: 'Combien coûte l\'installation de panneaux solaires ?',
                answer: 'Le coût varie selon la puissance et la surface, généralement entre 8 000€ et 15 000€ pour une installation résidentielle. Des aides de l\'État (MaPrimeRénov\', éco-prêt à taux zéro) peuvent réduire significativement ce montant.'
              },
              {
                question: 'Qu\'est-ce que la certification RGE ?',
                answer: 'RGE signifie "Reconnu Garant de l\'Environnement". C\'est une certification obligatoire pour les installateurs permettant aux particuliers de bénéficier des aides financières de l\'État. Elle garantit le professionnalisme et la qualité de l\'installation.'
              },
              {
                question: 'Quelle est la durée de vie des panneaux solaires ?',
                answer: 'Les panneaux solaires ont une durée de vie de 25 à 30 ans en moyenne. La plupart des fabricants garantissent 80% de performance après 25 ans. L\'onduleur, lui, doit généralement être remplacé après 10-15 ans.'
              },
              {
                question: 'Puis-je vendre mon surplus d\'électricité ?',
                answer: 'Oui ! Vous pouvez revendre votre surplus à EDF OA (Obligation d\'Achat) à un tarif réglementé. Vous pouvez aussi opter pour l\'autoconsommation totale avec batterie de stockage.'
              },
              {
                question: 'Combien de temps pour rentabiliser l\'investissement ?',
                answer: 'En moyenne, une installation photovoltaïque est rentabilisée en 10 à 15 ans. Avec les économies sur vos factures et la revente du surplus, vous pouvez économiser jusqu\'à 50% sur votre facture d\'électricité.'
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 group"
              >
                <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between text-gray-900 hover:text-primary-600">
                  {faq.question}
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à faire des économies ?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            Trouvez dès maintenant les meilleurs installateurs près de chez vous
          </p>
          <Link
            href="/photovoltaique"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-primary-600 bg-white rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl"
          >
            🚀 Commencer ma recherche
          </Link>
        </div>
      </section>
    </main>
  )
}
