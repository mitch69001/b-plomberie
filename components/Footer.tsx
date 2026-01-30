import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Footer() {
  // Récupérer les pages publiées
  const pages = await prisma.page.findMany({
    where: { published: true },
    orderBy: [
      { category: 'asc' },
      { title: 'asc' },
    ],
  })

  const legalPages = pages.filter(p => p.category === 'legal')
  const resourcePages = pages.filter(p => p.category === 'resource')

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">À propos</h3>
            <p className="text-sm leading-relaxed mb-4">
              Trouvez les meilleurs installateurs de panneaux solaires certifiés RGE partout en France. Service 100% gratuit et sans engagement.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/photovoltaique" className="hover:text-white transition-colors">Trouver un installateur</Link></li>
            </ul>
          </div>

          {/* Ressources */}
          {resourcePages.length > 0 && (
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Ressources</h3>
              <ul className="space-y-2 text-sm">
                {resourcePages.map(page => (
                  <li key={page.id}>
                    <Link href={`/${page.slug}`} className="hover:text-white transition-colors">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Légal */}
          {legalPages.length > 0 && (
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Informations légales</h3>
              <ul className="space-y-2 text-sm">
                {legalPages.map(page => (
                  <li key={page.id}>
                    <Link href={`/${page.slug}`} className="hover:text-white transition-colors">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center relative pb-2">
          <p>&copy; {new Date().getFullYear()} Installateurs Photovoltaïque. Tous droits réservés.</p>
          <p className="mt-2 text-gray-500">
            Service de mise en relation avec des installateurs de panneaux solaires certifiés RGE en France
          </p>
          {/* Accès admin discret */}
          <Link 
            href="/admin/login" 
            className="absolute bottom-4 right-6 text-gray-600 hover:text-gray-400 transition-all opacity-50 hover:opacity-100 hover:scale-110"
            aria-label="Administration"
            title="Administration"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  )
}
