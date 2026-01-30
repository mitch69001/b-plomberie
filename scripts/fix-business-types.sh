#!/bin/bash

# Script pour corriger latitude et longitude dans les interfaces Business

echo "🔧 Correction des types latitude/longitude dans toutes les interfaces Business..."

# Liste des fichiers à corriger
files=(
  "components/JsonLdSchema.tsx"
  "components/CityMap.tsx"
  "components/CityMapWrapper.tsx"
  "components/BusinessCard.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 $file"
    # Remplacer latitude: number par latitude: number | null
    sed -i '' 's/latitude: number$/latitude: number | null/g' "$file"
    # Remplacer longitude: number par longitude: number | null
    sed -i '' 's/longitude: number$/longitude: number | null/g' "$file"
  else
    echo "  ⚠️  $file non trouvé"
  fi
done

echo "✅ Correction terminée!"
