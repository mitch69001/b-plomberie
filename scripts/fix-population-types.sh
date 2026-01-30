#!/bin/bash

# Script pour corriger toutes les définitions de population? dans les interfaces City

echo "🔧 Correction des types population dans toutes les interfaces City..."

# Liste des fichiers à corriger
files=(
  "components/CityHero.tsx"
  "components/InternalLinks.tsx"
  "components/CitySearch.tsx"
  "lib/internal-linking.ts"
  "components/JsonLdSchema.tsx"
  "components/LeadForm.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 $file"
    # Remplacer population?: number par population?: number | null
    sed -i '' 's/population?: number$/population?: number | null/g' "$file"
  else
    echo "  ⚠️  $file non trouvé"
  fi
done

echo "✅ Correction terminée!"
