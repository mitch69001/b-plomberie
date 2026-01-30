#!/bin/bash

# Script pour corriger TOUS les types nullable dans TOUS les fichiers TS/TSX
# Basé sur le schema Prisma

echo "🔧 Correction exhaustive de tous les types nullable..."
echo ""

# Trouver tous les fichiers .ts et .tsx (sauf node_modules et .next)
files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "./node_modules/*" \
  ! -path "./.next/*" \
  ! -path "./scripts/fix-*.sh")

total=0

for file in $files; do
  changed=false
  
  # City fields
  if grep -q "population?: number$" "$file" 2>/dev/null; then
    sed -i '' 's/population?: number$/population?: number | null/g' "$file"
    changed=true
  fi
  
  if grep -q "customTitle?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/customTitle?: string$/customTitle?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "customDescription?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/customDescription?: string$/customDescription?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "customContent?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/customContent?: string$/customContent?: string | null/g' "$file"
    changed=true
  fi
  
  # Business fields
  if grep -q "latitude: number$" "$file" 2>/dev/null; then
    sed -i '' 's/latitude: number$/latitude: number | null/g' "$file"
    changed=true
  fi
  
  if grep -q "longitude: number$" "$file" 2>/dev/null; then
    sed -i '' 's/longitude: number$/longitude: number | null/g' "$file"
    changed=true
  fi
  
  if grep -q "phone?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/phone?: string$/phone?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "email?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/email?: string$/email?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "website?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/website?: string$/website?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "rating?: number$" "$file" 2>/dev/null; then
    sed -i '' 's/rating?: number$/rating?: number | null/g' "$file"
    changed=true
  fi
  
  if grep -q "reviewCount?: number$" "$file" 2>/dev/null; then
    sed -i '' 's/reviewCount?: number$/reviewCount?: number | null/g' "$file"
    changed=true
  fi
  
  if grep -q "openingHours?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/openingHours?: string$/openingHours?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "services?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/services?: string$/services?: string | null/g' "$file"
    changed=true
  fi
  
  # Lead fields
  if grep -q "message?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/message?: string$/message?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "budget?: string$" "$file" 2>/dev/null; then
    sed -i '' 's/budget?: string$/budget?: string | null/g' "$file"
    changed=true
  fi
  
  if grep -q "surface?: number$" "$file" 2>/dev/null; then
    sed -i '' 's/surface?: number$/surface?: number | null/g' "$file"
    changed=true
  fi
  
  if [ "$changed" = true ]; then
    echo "  ✅ $file"
    ((total++))
  fi
done

echo ""
echo "✅ Correction terminée! $total fichier(s) modifié(s)"
