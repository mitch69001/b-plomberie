import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Génération des métadonnées
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  const page = await prisma.page.findUnique({
    where: { slug, published: true },
  })

  if (!page) {
    return {
      title: 'Page non trouvée',
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params

  const page = await prisma.page.findUnique({
    where: { slug, published: true },
  })

  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: page.title }
            ]}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Lien retour */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-orange-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Prêt à installer des panneaux solaires ?
          </h2>
          <p className="text-primary-100 mb-6">
            Trouvez les meilleurs installateurs certifiés RGE près de chez vous
          </p>
          <Link
            href="/photovoltaique"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            🚀 Trouver un installateur
          </Link>
        </div>
      </div>
    </main>
  )
}
