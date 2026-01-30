/**
 * Script pour générer des contenus SEO uniques de 500 mots pour chaque ville
 * Optimisés pour "panneaux photovoltaïques + ville"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Données d'ensoleillement par région (kWh/m²/an)
const ENSOLEILLEMENT_PAR_REGION: Record<string, number> = {
  "Provence-Alpes-Côte d'Azur": 1700,
  "Occitanie": 1600,
  "Nouvelle-Aquitaine": 1450,
  "Corse": 1800,
  "Auvergne-Rhône-Alpes": 1400,
  "Bourgogne-Franche-Comté": 1300,
  "Centre-Val de Loire": 1250,
  "Pays de la Loire": 1300,
  "Bretagne": 1200,
  "Normandie": 1150,
  "Hauts-de-France": 1100,
  "Grand Est": 1200,
  "Île-de-France": 1150,
  "La Réunion": 1900,
}

// Templates de contenus variés
const TEMPLATES = [
  // Template 1 - Focus sur les économies
  (city: string, dept: string, region: string, population: number, ensoleillement: number) => `
# Installation de Panneaux Photovoltaïques à ${city}

## Pourquoi installer des panneaux solaires à ${city} ?

Située dans le département ${dept} en région ${region}, ${city} bénéficie d'un ensoleillement favorable pour l'installation de panneaux photovoltaïques. Avec environ ${ensoleillement} kWh/m²/an, votre installation solaire peut produire une quantité significative d'électricité tout au long de l'année.

## Les avantages de l'énergie solaire à ${city}

L'installation de panneaux photovoltaïques dans votre habitation à ${city} présente de nombreux avantages. Tout d'abord, vous réduisez considérablement votre facture d'électricité. En moyenne, une installation bien dimensionnée permet d'économiser entre 40% et 70% sur vos dépenses énergétiques annuelles. Pour une ville comme ${city} avec ses ${population.toLocaleString()} habitants, cela représente un potentiel d'économies considérable.

De plus, vous contribuez activement à la transition énergétique. Chaque kilowattheure produit par vos panneaux solaires est un kilowattheure qui n'émet pas de CO2. À l'échelle de ${city}, si seulement 10% des foyers s'équipaient en panneaux photovoltaïques, la réduction des émissions serait significative pour le département ${dept}.

## Les aides financières disponibles à ${city}

Les habitants de ${city} peuvent bénéficier de plusieurs dispositifs d'aide pour financer leur installation photovoltaïque. La prime à l'autoconsommation, versée par l'État, peut atteindre plusieurs milliers d'euros selon la puissance installée. Le département ${dept} et la région ${region} proposent également des aides complémentaires.

Le crédit d'impôt pour la transition énergétique et l'éco-prêt à taux zéro sont également accessibles aux propriétaires de ${city}. Ces dispositifs permettent de réduire significativement le coût initial de votre installation.

## Combien coûte une installation à ${city} ?

Le prix d'une installation photovoltaïque à ${city} varie selon plusieurs facteurs : la puissance installée, le type de panneaux choisis, et la complexité de la pose. En moyenne, comptez entre 8 000€ et 12 000€ pour une installation de 3 kWc, et entre 15 000€ et 20 000€ pour une installation de 6 kWc.

Après déduction des aides, le reste à charge peut être divisé par deux. La rentabilité est généralement atteinte en 10 à 12 ans dans la région ${region}, et vos panneaux continueront à produire pendant au moins 25 ans.

## Comment choisir son installateur à ${city} ?

Il est crucial de sélectionner un installateur qualifié et certifié RGE (Reconnu Garant de l'Environnement) à ${city}. Cette certification est obligatoire pour bénéficier des aides publiques. Comparez plusieurs devis, vérifiez les références de l'entreprise, et privilégiez les installateurs locaux du département ${dept} qui connaissent les spécificités climatiques de la région.

## La production attendue à ${city}

Avec un ensoleillement de ${ensoleillement} kWh/m²/an, une installation de 3 kWc à ${city} peut produire environ ${Math.round(ensoleillement * 3 * 0.85)} kWh par an, soit une économie de ${Math.round(ensoleillement * 3 * 0.85 * 0.20)}€ annuels (sur la base de 0,20€/kWh). Sur 25 ans, c'est plus de ${Math.round(ensoleillement * 3 * 0.85 * 0.20 * 25).toLocaleString()}€ d'économies cumulées.

Pour obtenir un devis personnalisé et gratuit pour votre projet photovoltaïque à ${city}, contactez dès maintenant nos installateurs partenaires certifiés RGE dans le département ${dept}.
`,

  // Template 2 - Focus sur l'écologie
  (city: string, dept: string, region: string, population: number, ensoleillement: number) => `
# Panneaux Solaires à ${city} : Guide Complet 2026

## ${city} et l'énergie solaire : un avenir durable

La ville de ${city}, avec ses ${population.toLocaleString()} habitants, s'inscrit pleinement dans la transition énergétique de la région ${region}. L'installation de panneaux photovoltaïques devient une solution privilégiée pour les foyers du département ${dept} souhaitant réduire leur empreinte carbone tout en réalisant des économies substantielles.

## Le potentiel solaire de ${city}

Le climat de la région ${region} offre des conditions favorables à la production d'énergie solaire. Avec un ensoleillement moyen de ${ensoleillement} kWh/m²/an, ${city} dispose d'un potentiel photovoltaïque intéressant. Que vous habitiez en centre-ville ou en périphérie de ${city}, votre toiture peut devenir une véritable centrale électrique personnelle.

## Types d'installations disponibles à ${city}

Les habitants de ${city} peuvent opter pour différents types d'installations photovoltaïques. L'autoconsommation avec revente du surplus est la solution la plus populaire dans le département ${dept}. Elle vous permet de consommer l'électricité que vous produisez et de revendre l'excédent à EDF OA.

L'autoconsommation totale, sans revente, est également possible à ${city}. Cette option convient aux foyers qui souhaitent maximiser leur indépendance énergétique. Enfin, certains propriétaires à ${city} choisissent la revente totale de leur production, particulièrement intéressante pour les grandes toitures.

## L'impact environnemental à ${city}

En installant des panneaux photovoltaïques à ${city}, vous contribuez directement à la réduction des émissions de gaz à effet de serre. Une installation moyenne de 3 kWc permet d'éviter l'émission d'environ 1,5 tonne de CO2 par an. Si 1 000 foyers de ${city} s'équipaient, ce serait 1 500 tonnes de CO2 évitées chaque année dans le département ${dept}.

La région ${region} s'est fixée des objectifs ambitieux en matière d'énergies renouvelables. En tant qu'habitant de ${city}, vous participez activement à l'atteinte de ces objectifs en choisissant l'énergie solaire.

## Les démarches administratives à ${city}

L'installation de panneaux photovoltaïques à ${city} nécessite quelques démarches administratives. Une déclaration préalable de travaux doit être déposée en mairie de ${city}. Dans certains cas, notamment si votre habitation est située dans un périmètre protégé du département ${dept}, un accord des Architectes des Bâtiments de France peut être requis.

Votre installateur RGE à ${city} vous accompagnera dans ces démarches et effectuera le raccordement au réseau Enedis. Le processus complet prend généralement entre 2 et 4 mois dans la région ${region}.

## Maintenance et durabilité à ${city}

Les panneaux photovoltaïques nécessitent peu d'entretien à ${city}. Un nettoyage annuel et une vérification régulière de l'onduleur suffisent généralement. La plupart des installations dans le département ${dept} fonctionnent sans problème pendant plus de 30 ans.

## Dimensionner son installation à ${city}

Pour une habitation moyenne à ${city} (4 personnes, consommation de 4 500 kWh/an), une installation de 3 à 4 kWc est recommandée. Cela représente environ 8 à 12 panneaux solaires et une surface de toiture de 15 à 25 m². Avec l'ensoleillement de ${ensoleillement} kWh/m²/an à ${city}, cette installation couvrira 50% à 70% de vos besoins énergétiques.

Demandez votre étude personnalisée gratuite auprès de nos installateurs certifiés RGE à ${city} pour déterminer la configuration optimale pour votre toiture dans le département ${dept}.
`,

  // Template 3 - Focus technique
  (city: string, dept: string, region: string, population: number, ensoleillement: number) => `
# Installation Photovoltaïque à ${city} : Tout ce qu'il faut savoir

## Le marché du photovoltaïque à ${city}

Le marché des panneaux solaires connaît un développement remarquable à ${city}. Dans le département ${dept}, de plus en plus de particuliers franchissent le pas et investissent dans l'énergie solaire. Cette tendance s'inscrit dans la dynamique de la région ${region} qui encourage activement les énergies renouvelables.

## Choisir ses panneaux solaires à ${city}

Plusieurs technologies de panneaux photovoltaïques sont disponibles pour les habitants de ${city}. Les panneaux monocristallins, reconnaissables à leur couleur noire uniforme, offrent le meilleur rendement (18% à 22%). Ils sont particulièrement adaptés aux toitures de ${city} avec une surface limitée.

Les panneaux polycristallins, de couleur bleue, présentent un rapport qualité-prix intéressant pour les installations dans le département ${dept}. Leur rendement de 15% à 18% convient parfaitement au climat de la région ${region}.

## L'onduleur : cœur de votre installation à ${city}

L'onduleur est un élément crucial de votre installation photovoltaïque à ${city}. Il transforme le courant continu produit par vos panneaux en courant alternatif utilisable dans votre habitation. Deux types d'onduleurs sont couramment installés dans le département ${dept} : l'onduleur central et les micro-onduleurs.

L'onduleur central équipe la majorité des installations à ${city}. Plus économique, il convient aux toitures bien exposées sans ombrage. Les micro-onduleurs, plus onéreux, sont recommandés pour les toitures complexes ou partiellement ombragées de ${city}.

## Optimiser l'orientation et l'inclinaison à ${city}

Pour maximiser la production de votre installation à ${city}, l'orientation et l'inclinaison sont déterminantes. L'orientation plein sud reste idéale dans la région ${region}, mais les orientations sud-est et sud-ouest donnent également d'excellents résultats.

L'inclinaison optimale pour ${city} se situe entre 30° et 35°, correspondant généralement à la pente naturelle des toitures du département ${dept}. Avec ces paramètres et l'ensoleillement de ${ensoleillement} kWh/m²/an, votre installation atteindra son potentiel maximal.

## Le stockage de l'énergie à ${city}

De plus en plus d'habitants de ${city} s'intéressent aux batteries de stockage. Ces systèmes permettent de conserver l'électricité produite en journée pour l'utiliser le soir ou la nuit. Dans le département ${dept}, les batteries lithium-ion dominent le marché avec une capacité de 5 à 15 kWh.

Bien que représentant un investissement supplémentaire, les batteries augmentent votre taux d'autoconsommation de 30% à 70% à ${city}. Elles constituent un pas de plus vers l'autonomie énergétique dans la région ${region}.

## Garanties et assurances à ${city}

Les panneaux photovoltaïques installés à ${city} bénéficient de plusieurs garanties. La garantie produit couvre généralement 10 à 12 ans, tandis que la garantie de performance linéaire s'étend sur 25 ans (garantissant au minimum 80% de la puissance initiale).

Votre assurance habitation à ${city} doit être informée de l'installation. La plupart des assureurs dans le département ${dept} incluent les panneaux photovoltaïques sans surcoût, mais vérifiez votre contrat.

## Monitoring de votre installation à ${city}

Les installations modernes à ${city} incluent des systèmes de monitoring. Ces applications vous permettent de suivre en temps réel la production de vos panneaux, de détecter d'éventuelles anomalies, et d'optimiser votre consommation. Dans la région ${region}, ces outils deviennent standard.

Contactez nos installateurs certifiés RGE à ${city} pour obtenir votre devis gratuit et personnalisé, incluant les dernières technologies de monitoring adaptées au climat du département ${dept}.
`,

  // Template 4 - Focus sur la rentabilité
  (city: string, dept: string, region: string, population: number, ensoleillement: number) => `
# Rentabilité des Panneaux Solaires à ${city}

## Investir dans le solaire à ${city} : est-ce rentable ?

L'installation de panneaux photovoltaïques à ${city} représente un investissement intelligent pour les ${population.toLocaleString()} habitants de cette commune du département ${dept}. Avec les conditions d'ensoleillement de la région ${region}, la rentabilité est au rendez-vous.

## Calcul de rentabilité à ${city}

Pour une installation standard de 3 kWc à ${city}, l'investissement initial se situe entre 7 000€ et 10 000€ après aides. Avec un ensoleillement de ${ensoleillement} kWh/m²/an, votre installation produira environ ${Math.round(ensoleillement * 3 * 0.85)} kWh par an.

En autoconsommation avec revente du surplus dans le département ${dept}, vous économiserez environ ${Math.round(ensoleillement * 3 * 0.85 * 0.60 * 0.20)}€ sur votre facture électrique, et gagnerez ${Math.round(ensoleillement * 3 * 0.85 * 0.40 * 0.13)}€ grâce à la revente. Soit un total de ${Math.round(ensoleillement * 3 * 0.85 * 0.60 * 0.20 + ensoleillement * 3 * 0.85 * 0.40 * 0.13)}€ par an.

## Le temps de retour sur investissement à ${city}

Dans la région ${region}, le temps de retour sur investissement pour une installation photovoltaïque varie entre 9 et 14 ans. À ${city}, avec l'ensoleillement actuel, vous pouvez espérer une rentabilité atteinte en 10 à 12 ans environ. Ensuite, vos panneaux continueront à produire pendant 15 à 20 ans supplémentaires, générant un bénéfice net conséquent.

## Les revenus de la revente à ${city}

Si vous optez pour la revente du surplus à ${city}, EDF Obligation d'Achat rachète votre électricité à un tarif garanti pendant 20 ans. Pour une installation de 3 kWc dans le département ${dept}, ce tarif est actuellement de 0,13€/kWh. Sur 20 ans, c'est plusieurs milliers d'euros de revenus garantis.

## L'évolution des prix de l'électricité à ${city}

Un facteur clé de la rentabilité à ${city} est l'augmentation régulière des prix de l'électricité. En région ${region}, comme partout en France, le tarif réglementé a augmenté de plus de 50% en 10 ans. En produisant votre propre électricité à ${city}, vous vous protégez contre ces hausses futures.

Si les prix continuent d'augmenter de 3% par an, votre installation photovoltaïque à ${city} sera rentabilisée encore plus rapidement que prévu. Chaque kilowattheure auto-consommé représente une économie croissante dans le département ${dept}.

## La plus-value immobilière à ${city}

Au-delà des économies directes, les panneaux photovoltaïques augmentent la valeur de votre bien immobilier à ${city}. Les études montrent qu'une maison équipée de panneaux solaires dans la région ${region} se vend 4% à 5% plus cher qu'une maison similaire sans installation.

Pour une maison de valeur moyenne à ${city}, cela représente une plus-value de plusieurs milliers d'euros. De plus, votre bien sera mieux classé au diagnostic de performance énergétique (DPE), un atout majeur dans le département ${dept}.

## Optimiser sa rentabilité à ${city}

Pour maximiser la rentabilité de votre installation à ${city}, plusieurs stratégies existent. Augmentez votre taux d'autoconsommation en programmant vos appareils électroménagers pendant les heures d'ensoleillement. À ${city}, un simple changement d'habitudes peut augmenter votre autoconsommation de 30% à 60%.

Dimensionnez correctement votre installation : ni trop petite (vous n'optimisez pas votre potentiel), ni trop grande (le surplus devient moins rentable). Un installateur RGE à ${city} réalisera une étude personnalisée pour votre habitation dans le département ${dept}.

## Les aides qui boostent la rentabilité à ${city}

Les aides disponibles à ${city} améliorent considérablement la rentabilité. La prime à l'autoconsommation peut atteindre 1 140€ pour 3 kWc, versée sur les 5 premières années. Le département ${dept} et la région ${region} proposent parfois des aides complémentaires.

Obtenez dès maintenant votre étude de rentabilité personnalisée gratuite auprès de nos installateurs partenaires certifiés RGE à ${city}.
`,
]

function getEnsoleillement(region: string): number {
  return ENSOLEILLEMENT_PAR_REGION[region] || 1300
}

function getRandomTemplate() {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
}

async function generateCityContents() {
  console.log('🚀 Début de la génération des contenus pour chaque ville...\n')
  
  try {
    // Récupérer toutes les villes
    const cities = await prisma.city.findMany({
      orderBy: {
        population: 'desc'
      }
    })
    
    console.log(`📊 ${cities.length} villes trouvées\n`)
    
    let updated = 0
    let errors = 0
    
    for (const city of cities) {
      try {
        // Choisir un template aléatoire pour varier les contenus
        const template = getRandomTemplate()
        const ensoleillement = getEnsoleillement(city.region)
        
        // Générer le contenu
        const content = template(
          city.name,
          city.department,
          city.region,
          city.population || 0,
          ensoleillement
        ).trim()
        
        // Mettre à jour la ville avec le contenu
        await prisma.city.update({
          where: { id: city.id },
          data: {
            customContent: content,
            // Mettre à jour aussi les métadonnées SEO si elles n'existent pas
            customTitle: city.customTitle || `Panneaux Photovoltaïques à ${city.name} (${city.department}) | Devis Gratuit`,
            customDescription: city.customDescription || `Installation de panneaux solaires à ${city.name}. Profitez des aides et économisez sur votre facture. Devis gratuit par installateurs RGE certifiés dans le ${city.department}.`
          }
        })
        
        updated++
        console.log(`✅ Contenu généré pour ${city.name} (${content.length} caractères, ~${Math.round(content.split(' ').length)} mots)`)
        
      } catch (error) {
        errors++
        console.error(`❌ Erreur pour ${city.name}:`, error)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ')
    console.log('='.repeat(60))
    console.log(`✅ Contenus générés: ${updated}`)
    console.log(`❌ Erreurs: ${errors}`)
    console.log('='.repeat(60))
    
    // Afficher quelques statistiques sur les contenus
    const citiesWithContent = await prisma.city.findMany({
      where: {
        customContent: {
          not: null
        }
      },
      select: {
        name: true,
        customContent: true
      }
    })
    
    const avgLength = citiesWithContent.reduce((acc, city) => {
      return acc + (city.customContent?.length || 0)
    }, 0) / citiesWithContent.length
    
    const avgWords = citiesWithContent.reduce((acc, city) => {
      return acc + (city.customContent?.split(' ').length || 0)
    }, 0) / citiesWithContent.length
    
    console.log('\n📈 Statistiques des contenus:')
    console.log(`  - Longueur moyenne: ${Math.round(avgLength)} caractères`)
    console.log(`  - Nombre moyen de mots: ${Math.round(avgWords)} mots`)
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
generateCityContents()
  .then(() => {
    console.log('\n✅ Script terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
