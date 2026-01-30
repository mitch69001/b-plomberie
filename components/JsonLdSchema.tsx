interface City {
  name: string
  slug: string
  postalCode: string
}

interface Business {
  name: string
  address: string
  postalCode: string
  phone?: string | null
  website?: string | null
  rating?: number | null
  reviewCount?: number | null
  latitude?: number | null
  longitude?: number | null
}

interface JsonLdSchemaProps {
  city: City
  businesses: Business[]
}

export default function JsonLdSchema({ city, businesses }: JsonLdSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votredomaine.fr'

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Photovoltaïque',
        item: `${baseUrl}/photovoltaique`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `${baseUrl}/photovoltaique/${city.slug}`,
      },
    ],
  }

  // ItemList Schema for businesses
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: businesses.length,
    itemListElement: businesses.map((business, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        additionalType: 'ProfessionalService',
        name: business.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          addressLocality: city.name,
          postalCode: business.postalCode,
          addressCountry: 'FR',
        },
        ...(business.latitude && business.longitude && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }),
        ...(business.phone && { telephone: business.phone }),
        ...(business.website && { url: business.website }),
        ...(business.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: business.rating,
            ...(business.reviewCount && { reviewCount: business.reviewCount }),
            bestRating: 5,
            worstRating: 1,
          },
        }),
      },
    })),
  }

  // FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Combien coûte une installation de panneaux solaires à ${city.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Le coût d'une installation de panneaux solaires à ${city.name} varie entre 8 000€ et 15 000€ pour une installation résidentielle standard de 3 à 6 kWc.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quelles sont les aides disponibles à ${city.name} pour l'installation de panneaux solaires ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Les habitants de ${city.name} peuvent bénéficier de la prime à l'autoconsommation photovoltaïque, du tarif d'achat garanti par EDF OA, de la TVA à taux réduit (10%), et éventuellement des aides locales.`,
        },
      },
      {
        '@type': 'Question',
        name: `Comment choisir un installateur de panneaux solaires à ${city.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Vérifiez la certification RGE, les avis clients, l'expérience dans le photovoltaïque, la garantie proposée et la transparence des devis.`,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
