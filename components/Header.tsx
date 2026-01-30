import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="b-photovoltaique.fr - Installateurs panneaux solaires" 
              width={450}
              height={85}
              className="h-16 w-auto sm:h-20"
              priority
            />
          </Link>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/photovoltaique" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Trouver un installateur
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center space-x-4">
            <Link
              href="/photovoltaique"
              className="hidden sm:inline-flex bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Obtenir un devis
            </Link>
            
            {/* Menu mobile */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
