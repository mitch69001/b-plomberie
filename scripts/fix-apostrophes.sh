#!/bin/bash

# Script pour remplacer toutes les apostrophes typographiques par des apostrophes normales

echo "🔧 Correction des apostrophes typographiques dans tous les fichiers..."
echo ""

# Trouver tous les fichiers .ts, .tsx, .js, .jsx (sauf node_modules et .next)
files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "./node_modules/*" \
  ! -path "./.next/*" \
  ! -path "./scripts/fix-*.sh")

total=0

for file in $files; do
  # Vérifier si le fichier contient des apostrophes typographiques
  if grep -q "[''‚‛]" "$file" 2>/dev/null; then
    # Remplacer toutes les apostrophes typographiques par des apostrophes normales
    # ' (U+2018) et ' (U+2019) par ' (U+0027)
    sed -i '' "s/'/'/g" "$file"
    sed -i '' "s/'/'/g" "$file"
    sed -i '' "s/‚/'/g" "$file"
    sed -i '' "s/‛/'/g" "$file"
    echo "  ✅ $file"
    ((total++))
  fi
done

echo ""
echo "✅ Correction terminée! $total fichier(s) modifié(s)"
