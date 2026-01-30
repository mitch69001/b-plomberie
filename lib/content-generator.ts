/**
 * Générateur de contenu dynamique personnalisé pour les pages villes
 */

interface City {
  name: string
  postalCode: string
  department: string
  region: string
  population?: number | null
}

interface ContentTemplate {
  intro: string
  benefits: string[]
  faq: Array<{ question: string; answer: string }>
  processText: string
  whyRGEText: string
  localAdvantagesText: string
}

/**
 * Templates d'introduction variés pour différencier les pages
 */
const introTemplates = [
  (city: City, businessCount: number, sunHours: number) => 
    `${city.name}, située dans le département ${city.department} en région ${city.region}, bénéficie d'un ensoleillement annuel moyen de ${sunHours} heures. Cette exposition solaire favorable fait de votre commune un territoire idéal pour l'installation de panneaux photovoltaïques. Nous avons sélectionné ${businessCount} installateur${businessCount > 1 ? 's' : ''} professionnel${businessCount > 1 ? 's' : ''} certifié${businessCount > 1 ? 's' : ''} RGE, tous spécialisés dans les solutions d'énergie solaire et capables d'accompagner les habitants de ${city.name} dans leur projet de transition énergétique.`,
  
  (city: City, businessCount: number, sunHours: number) => 
    `Vous envisagez d'installer des panneaux solaires à ${city.name} (${city.postalCode}) ? Excellente décision ! Avec environ ${sunHours}h d'ensoleillement par an dans la région ${city.region}, votre investissement sera rapidement rentabilisé. Notre plateforme vous met en relation avec ${businessCount} professionnel${businessCount > 1 ? 's' : ''} de confiance, tous certifiés RGE et expérimentés dans l'installation photovoltaïque sur le territoire du ${city.department}. Comparez les devis et choisissez l'installateur qui correspond le mieux à vos besoins.`,
  
  (city: City, businessCount: number, sunHours: number) => 
    `L'énergie solaire représente une opportunité majeure pour les habitants de ${city.name}. Dans le ${city.department}, région ${city.region}, le potentiel photovoltaïque est excellent grâce à ${sunHours} heures d'ensoleillement annuel. Pour concrétiser votre projet, nous avons référencé ${businessCount} installateur${businessCount > 1 ? 's' : ''} qualifié${businessCount > 1 ? 's' : ''} RGE à proximité de ${city.name}. Ces professionnels sauront dimensionner votre installation selon vos besoins et vous accompagner dans l'obtention des aides financières disponibles.`,
]

/**
 * Variations de bénéfices selon le contexte régional
 */
const benefitVariations = {
  sunny: [
    `Profitez d'un ensoleillement exceptionnel pour maximiser votre production`,
    `Amortissez votre installation en 8-12 ans grâce à l'ensoleillement favorable`,
    `Production énergétique optimale toute l'année`,
  ],
  moderate: [
    `Réduisez votre facture d'électricité jusqu'à 60% par an`,
    `Installation rentable même avec un ensoleillement modéré`,
    `Autoconsommation et revente du surplus à EDF OA`,
  ],
  urban: [
    `Valorisez votre patrimoine immobilier avec une installation moderne`,
    `Gagnez en autonomie énergétique en zone urbaine`,
    `Solutions adaptées aux contraintes architecturales locales`,
  ],
}

export function generateCityContent(city: City, businessCount: number): ContentTemplate {
  const sunHours = estimateSunHours(city.region)
  const climateType = getClimateType(sunHours)
  const isUrban = (city.population || 0) > 50000
  
  // Sélectionner un template d'intro de manière pseudo-aléatoire basée sur le nom de la ville
  const templateIndex = city.name.length % introTemplates.length
  const intro = introTemplates[templateIndex](city, businessCount, sunHours)
  
  // Construire les bénéfices variés
  const commonBenefits = [
    `${businessCount} installateur${businessCount > 1 ? 's' : ''} certifié${businessCount > 1 ? 's' : ''} RGE à ${city.name}`,
    `Démarches simplifiées pour les aides de l'État et locales`,
    `Garantie décennale et assurance responsabilité civile`,
    `Accompagnement complet de A à Z`,
    `Devis gratuits et sans engagement`,
  ]
  
  const specificBenefits = climateType === 'sunny' 
    ? benefitVariations.sunny 
    : isUrban 
    ? benefitVariations.urban 
    : benefitVariations.moderate
  
  const benefits = [...specificBenefits, ...commonBenefits.slice(0, 3)]
  
  return {
    intro,
    benefits,
    faq: generateFAQ(city, sunHours, businessCount),
    processText: generateProcessText(city),
    whyRGEText: generateWhyRGEText(city),
    localAdvantagesText: generateLocalAdvantagesText(city, sunHours),
  }
}

/**
 * Génère des FAQ variées et personnalisées
 */
function generateFAQ(city: City, sunHours: number, businessCount: number): Array<{ question: string; answer: string }> {
  const productionEstimate = Math.round((sunHours / 1000) * 1000)
  const roi = sunHours > 2200 ? '8 à 10 ans' : sunHours > 1900 ? '10 à 12 ans' : '12 à 15 ans'
  
  return [
    {
      question: `Quel est le coût d'une installation photovoltaïque à ${city.name} ?`,
      answer: `À ${city.name} (${city.department}), le prix d'une installation résidentielle de panneaux solaires se situe entre 8 000€ et 16 000€ pour une puissance de 3 à 6 kWc. Le coût final dépend de plusieurs facteurs : la puissance installée, la qualité des panneaux choisis, la complexité de pose sur votre toiture, et les éventuels travaux de raccordement. Les aides de l'État (prime à l'autoconsommation, TVA réduite) et les dispositifs locaux de la région ${city.region} peuvent réduire considérablement votre investissement initial.`,
    },
    {
      question: `Combien de kWh produit une installation solaire à ${city.name} ?`,
      answer: `Dans la région ${city.region}, avec un ensoleillement moyen de ${sunHours}h/an, une installation de 3 kWc à ${city.name} produit entre ${productionEstimate} et ${productionEstimate + 600} kWh par an. Pour une installation de 6 kWc, vous pouvez espérer entre ${productionEstimate * 2} et ${productionEstimate * 2 + 1200} kWh/an. Cette production couvre généralement 40 à 70% des besoins d'un foyer standard, permettant des économies substantielles sur votre facture d'électricité.`,
    },
    {
      question: `Quelles aides financières pour installer des panneaux solaires à ${city.name} ?`,
      answer: `Les habitants de ${city.name} peuvent cumuler plusieurs aides pour leur projet solaire : la prime à l'autoconsommation (jusqu'à 380€/kWc), le tarif d'achat garanti d'EDF OA (environ 0,13€/kWh), la TVA à taux réduit (10% au lieu de 20%), et potentiellement des aides locales du département ${city.department} ou de la région ${city.region}. Nos ${businessCount} installateur${businessCount > 1 ? 's' : ''} partenaire${businessCount > 1 ? 's' : ''} vous accompagnent gratuitement dans ces démarches administratives.`,
    },
    {
      question: `Quel est le temps de retour sur investissement à ${city.name} ?`,
      answer: `À ${city.name}, grâce à l'ensoleillement de ${sunHours}h/an dans le ${city.department}, le retour sur investissement d'une installation photovoltaïque se situe généralement entre ${roi}. Ce délai peut être réduit en optimisant votre autoconsommation et en bénéficiant de l'intégralité des aides disponibles. Au-delà de cette période, votre installation continue de produire de l'électricité gratuitement pendant 15 à 20 ans supplémentaires, garantissant une rentabilité excellente sur le long terme.`,
    },
    {
      question: `Comment choisir le bon installateur de panneaux solaires à ${city.name} ?`,
      answer: `Pour sélectionner un installateur fiable à ${city.name}, vérifiez systématiquement ces critères essentiels : la certification RGE (obligatoire pour les aides), l'assurance décennale en cours de validité, les avis clients vérifiés, l'expérience spécifique en photovoltaïque (au moins 3 ans), la transparence du devis (détail des équipements et prestations), et les garanties proposées. Tous les ${businessCount} professionnel${businessCount > 1 ? 's' : ''} présent${businessCount > 1 ? 's' : ''} dans notre annuaire pour ${city.name} ont été présélectionnés selon ces critères stricts.`,
    },
    {
      question: `Les panneaux solaires sont-ils rentables à ${city.name} ?`,
      answer: `Absolument ! Malgré les idées reçues, ${city.name} offre un potentiel solaire intéressant avec ${sunHours}h d'ensoleillement annuel. Une installation bien dimensionnée et correctement orientée permet de réduire votre facture d'électricité de 40 à 70%, tout en bénéficiant de la revente du surplus de production à EDF. Avec les aides actuelles et l'augmentation continue des tarifs d'électricité, l'investissement dans le solaire à ${city.name} est non seulement écologique mais aussi économiquement très attractif.`,
    },
  ]
}

/**
 * Détermine le type de climat pour adapter le contenu
 */
function getClimateType(sunHours: number): 'sunny' | 'moderate' | 'cloudy' {
  if (sunHours >= 2300) return 'sunny'
  if (sunHours >= 1800) return 'moderate'
  return 'cloudy'
}

/**
 * Estime les heures d'ensoleillement selon la région
 */
function estimateSunHours(region: string): number {
  const sunHoursMap: { [key: string]: number } = {
    'Provence-Alpes-Côte d\'Azur': 2800,
    'Occitanie': 2500,
    'Nouvelle-Aquitaine': 2200,
    'Auvergne-Rhône-Alpes': 2100,
    'Corse': 2900,
    'Pays de la Loire': 1900,
    'Centre-Val de Loire': 1900,
    'Bretagne': 1700,
    'Normandie': 1650,
    'Hauts-de-France': 1600,
    'Grand Est': 1750,
    'Bourgogne-Franche-Comté': 1900,
    'Île-de-France': 1750,
  }

  return sunHoursMap[region] || 2000
}

/**
 * Génère un titre H1 optimisé SEO
 */
export function generateH1(city: City): string {
  return `Installateur Panneaux Solaires à ${city.name} (${city.postalCode})`
}

/**
 * Génère une meta description optimisée
 */
export function generateMetaDescription(city: City, businessCount: number): string {
  return `Trouvez les meilleurs installateurs de panneaux solaires à ${city.name} (${city.postalCode}). ${businessCount} professionnel${businessCount > 1 ? 's' : ''} certifié${businessCount > 1 ? 's' : ''} RGE. Comparez et demandez un devis gratuit.`
}

/**
 * Génère un titre de page optimisé
 */
export function generatePageTitle(city: City): string {
  return `Installateur Panneaux Solaires ${city.name} (${city.postalCode}) | Devis Gratuit`
}

/**
 * Génère le texte explicatif sur le processus d'installation avec liens in-text
 */
function generateProcessText(city: City): string {
  // Variations de texte avec liens contextuels
  const variations = [
    `L'installation de panneaux photovoltaïques à ${city.name} suit un processus structuré en plusieurs étapes clés. Tout commence par une étude de faisabilité personnalisée : nos installateurs partenaires se déplacent à votre domicile pour évaluer l'orientation de votre toiture, son inclinaison, l'absence d'ombrage et la surface exploitable. Cette visite technique permet également d'étudier votre consommation électrique actuelle et de dimensionner précisément l'installation dont vous avez besoin. Suite à cette analyse, vous recevez un devis détaillé comprenant le matériel, la main d'œuvre, les démarches administratives et le montant des aides financières déductibles. Une fois le devis accepté, votre installateur s'occupe de toutes les formalités : déclaration préalable de travaux en mairie de ${city.name}, demande de raccordement auprès d'Enedis, et constitution du dossier pour les aides de l'État. Les travaux d'installation durent généralement 1 à 3 jours selon la complexité du projet. Après la pose, votre installation est mise en service et vous commencez immédiatement à produire votre propre électricité verte.`,
    
    `Le processus d'installation de panneaux solaires à ${city.name} débute par un audit énergétique complet de votre habitation. Un professionnel certifié RGE analyse votre toiture, votre consommation électrique et vos objectifs en termes d'économies d'énergie. Cette expertise permet de dimensionner avec précision votre future installation photovoltaïque et d'optimiser votre retour sur investissement. Après validation du devis, votre installateur prend en charge l'ensemble des démarches administratives auprès de la mairie de ${city.name} et d'Enedis. La pose des panneaux solaires s'effectue en 2 à 3 jours selon la configuration de votre toiture. Une fois raccordée au réseau, votre installation commence immédiatement à produire de l'électricité verte et à réduire vos factures énergétiques.`,
  ]
  
  const index = city.name.length % variations.length
  return variations[index]
}

/**
 * Génère le texte sur l'importance de la certification RGE avec contexte géographique
 */
function generateWhyRGEText(city: City): string {
  const variations = [
    `Choisir un installateur certifié RGE (Reconnu Garant de l'Environnement) à ${city.name} n'est pas qu'une simple recommandation, c'est une obligation légale pour bénéficier des aides financières de l'État. Cette certification garantit que l'entreprise possède les compétences techniques nécessaires pour réaliser des travaux de rénovation énergétique dans les règles de l'art. Pour obtenir et conserver ce label, les professionnels doivent suivre des formations régulières et justifier d'une assurance décennale en cours de validité. Dans le ${city.department}, tous nos installateurs partenaires sont certifiés RGE, ce qui vous assure non seulement l'accès aux aides (prime à l'autoconsommation, TVA réduite, tarif d'achat EDF OA) mais aussi un travail de qualité conforme aux normes en vigueur. Au-delà de l'aspect réglementaire, faire appel à un installateur RGE à ${city.name} vous protège contre les arnaques malheureusement trop fréquentes dans le secteur du photovoltaïque. Ces professionnels sont soumis à des contrôles réguliers et doivent respecter un cahier des charges strict, garantissant ainsi la pérennité et la performance de votre installation solaire.`,
    
    `La certification RGE (Reconnu Garant de l'Environnement) est le gage d'un installateur qualifié à ${city.name}. Sans cette certification, vous ne pourrez pas prétendre aux aides de l'État comme MaPrimeRénov', la prime à l'autoconsommation ou le tarif d'achat bonifié EDF OA. Dans la région ${city.region}, le label RGE est synonyme de qualité et d'expertise : les installateurs doivent justifier d'une formation spécifique, d'une expérience confirmée et d'une assurance décennale à jour. En choisissant un professionnel RGE dans le ${city.department}, vous bénéficiez d'une installation conforme aux normes NF C 15-100 et d'un accompagnement complet dans vos démarches administratives. Cette certification protège également les particuliers contre les entreprises peu scrupuleuses qui proposent des installations de mauvaise qualité ou ne respectent pas les règles de l'art.`,
  ]
  
  const index = (city.name.charCodeAt(0) + city.postalCode.length) % variations.length
  return variations[index]
}

/**
 * Génère le texte sur les avantages locaux du solaire
 */
function generateLocalAdvantagesText(city: City, sunHours: number): string {
  const climateType = getClimateType(sunHours)
  
  if (climateType === 'sunny') {
    return `${city.name} bénéficie d'un ensoleillement particulièrement généreux avec ${sunHours} heures de soleil par an, ce qui place la région ${city.region} parmi les territoires les plus favorables de France pour le photovoltaïque. Cette exposition solaire exceptionnelle se traduit par une production électrique optimale tout au long de l'année, même en hiver. Les installations photovoltaïques dans le ${city.department} affichent des rendements supérieurs à la moyenne nationale, permettant un retour sur investissement plus rapide. De plus, la demande croissante en énergie renouvelable dans votre commune s'accompagne souvent d'aides locales complémentaires. Les collectivités territoriales de ${city.region} encouragent activement la transition énergétique en proposant des subventions additionnelles ou des prêts à taux zéro. Installer des panneaux solaires à ${city.name}, c'est aussi valoriser votre patrimoine immobilier : les biens équipés d'installations photovoltaïques se vendent plus facilement et plus cher, car ils représentent une source d'économies garanties pour les futurs propriétaires.`
  } else if (climateType === 'moderate') {
    return `Avec ${sunHours} heures d'ensoleillement annuel, ${city.name} offre un potentiel solaire tout à fait intéressant pour l'installation de panneaux photovoltaïques. Contrairement aux idées reçues, un ensoleillement modéré ne constitue absolument pas un frein à la rentabilité d'un projet solaire. Les technologies actuelles de cellules photovoltaïques sont particulièrement performantes même par temps nuageux ou en lumière diffuse. Dans le ${city.department}, de nombreux foyers ont déjà franchi le pas et constatent des économies substantielles sur leurs factures d'électricité. Le principal avantage à ${city.name} réside dans l'autoconsommation : plutôt que de revendre l'intégralité de votre production, vous consommez directement l'électricité que vous produisez, ce qui maximise vos économies face à la hausse constante du prix du kWh. Les pouvoirs publics de la région ${city.region} soutiennent activement cette démarche en facilitant l'accès aux aides et en simplifiant les démarches administratives. Investir dans le solaire à ${city.name}, c'est faire le choix d'une énergie locale, propre et économique, tout en contribuant aux objectifs de neutralité carbone fixés par votre territoire.`
  } else {
    return `Même avec ${sunHours} heures d'ensoleillement par an, ${city.name} présente un réel intérêt pour l'installation de panneaux solaires. Les progrès technologiques récents ont considérablement amélioré le rendement des modules photovoltaïques en conditions de faible luminosité. Les installations dans le ${city.department} produisent désormais de l'électricité même par temps couvert, grâce aux cellules à haut rendement et aux micro-onduleurs qui optimisent la production panneau par panneau. À ${city.name}, l'autoconsommation devient la stratégie gagnante : vous utilisez directement l'électricité produite pendant la journée pour alimenter vos équipements domestiques, réduisant ainsi votre dépendance au réseau et vos factures d'électricité. La région ${city.region} propose d'ailleurs des aides spécifiques pour encourager l'autoconsommation photovoltaïque. Par ailleurs, l'évolution du prix de l'électricité rend votre investissement encore plus pertinent : chaque kWh produit par vos panneaux est un kWh que vous n'achetez pas au tarif réglementé, qui ne cesse d'augmenter. Enfin, au-delà de l'aspect financier, produire votre propre énergie à ${city.name} vous offre une autonomie énergétique appréciable et vous engage concrètement dans la transition écologique.`
  }
}

/**
 * Fonction slugify pour les URLs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
