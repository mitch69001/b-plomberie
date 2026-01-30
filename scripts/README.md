# Scripts d'importation et de scraping

## Scripts disponibles

### 1. Import des villes (`seed-cities.ts`)

Importe toutes les communes françaises depuis l'API Geo.gouv.fr (~36 000 communes).

**Utilisation:**

```bash
# Assurez-vous d'avoir configuré DATABASE_URL dans .env
npx tsx scripts/seed-cities.ts
```

**Données importées:**
- Nom de la commune
- Code postal
- Département et région
- Population
- Coordonnées GPS (latitude/longitude)

### 2. Scraping des entreprises

Les scripts de scraping seront ajoutés dans `scripts/scraper/`:
- `google-maps.ts` - Scraping Google Maps
- `pages-jaunes.ts` - Scraping Pages Jaunes
- `rge-scraper.ts` - Scraping annuaire RGE
- `orchestrator.ts` - Orchestration du scraping

## Prérequis

1. Base de données PostgreSQL configurée
2. Variables d'environnement dans `.env`
3. Dépendances installées (`npm install`)

## Installation de tsx (pour exécuter les scripts TypeScript)

```bash
npm install -g tsx
```

Ou utilisez `npx tsx` pour l'exécuter sans installation globale.
