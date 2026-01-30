import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Installateurs Panneaux Solaires - Trouvez un professionnel près de chez vous',
  description: 'Trouvez les meilleurs installateurs de panneaux photovoltaïques certifiés RGE dans toute la France. Comparez et demandez des devis gratuits.',
  keywords: 'panneaux solaires, photovoltaïque, installateur, RGE, devis gratuit',
  other: {
    'google-site-verification': 'Y74BsOrkaE0iB9j_uqHm48INAB7U7ieozILdckpntJI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen">
          {children}
        </div>
        <Footer />
        
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          src="https://plausible.io/js/pa-310H0uzqGOycToRQYFB7l.js"
          strategy="afterInteractive"
          async
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()
          `}
        </Script>
      </body>
    </html>
  )
}
