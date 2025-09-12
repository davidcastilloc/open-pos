#!/bin/bash

# Script para sincronizar la rama production con main
# Maneja conflictos de merge y actualizaciones de archivos de producción

set -e

echo "🔄 Sincronizando rama production con main..."

# Configurar Git
git config --global user.name "GitHub Actions Bot"
git config --global user.email "github-actions-bot@users.noreply.github.com"

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"

# Fetch de todos los cambios remotos
echo "📥 Obteniendo cambios remotos..."
git fetch origin

# Verificar si la rama production existe localmente
if git show-ref --quiet refs/heads/production; then
    echo "✅ Rama production existe localmente"
    git checkout production
    # Intentar hacer pull de la rama remota
    if git pull origin production 2>/dev/null; then
        echo "✅ Rama production actualizada desde remoto"
    else
        echo "⚠️  No se pudo hacer pull de production, continuando..."
    fi
else
    echo "🆕 Creando rama production localmente..."
    # Verificar si existe en remoto
    if git show-ref --quiet refs/remotes/origin/production; then
        echo "📋 Rama production existe en remoto, creando tracking local"
        git checkout -b production origin/production
    else
        echo "🆕 Creando nueva rama production desde main"
        git checkout -b production
    fi
fi

echo "🔄 Fusionando main en production..."
# Intentar merge de main
if git merge origin/main --no-edit; then
    echo "✅ Merge exitoso"
else
    echo "⚠️  Conflicto de merge detectado, resolviendo..."
    git status
    
    # Resolver conflictos automáticamente usando la versión de main
    echo "🔧 Resolviendo conflictos usando versión de main..."
    git checkout --theirs . 2>/dev/null || true
    git add . 2>/dev/null || true
    
    # Crear commit de resolución
    if git diff --cached --quiet; then
        echo "ℹ️  No hay cambios para commitear"
    else
        git commit -m "chore: resolve merge conflicts, sync production with main (auto)" || true
        echo "✅ Conflictos resueltos y commiteados"
    fi
fi

# Crear directorio public si no existe
mkdir -p public

# Copiar CHANGELOG.md a public
if [ -f "CHANGELOG.md" ]; then
    cp CHANGELOG.md public/CHANGELOG.md
    echo "📋 CHANGELOG.md copiado a public/"
else
    echo "⚠️  CHANGELOG.md no encontrado"
fi

# Actualizar version.json
if [ -f "scripts/update-version.ts" ]; then
    echo "🔢 Actualizando version.json..."
    pnpm tsx scripts/update-version.ts
    echo "✅ version.json actualizado"
else
    echo "⚠️  Script update-version.ts no encontrado"
fi

# Agregar archivos de producción
git add -f public/CHANGELOG.md public/version.json 2>/dev/null || true

# Commitear cambios si hay algo que commitear
if ! git diff --cached --quiet; then
    git commit -m "chore: sync production with main (auto)"
    echo "✅ Cambios de producción commiteados"
else
    echo "ℹ️  No hay cambios de producción para commitear"
fi

# Push a la rama remota
echo "📤 Enviando cambios a origin/production..."
if git push origin production; then
    echo "✅ Push exitoso a origin/production"
else
    echo "❌ Error en push, intentando force push..."
    git push --force-with-lease origin production || {
        echo "❌ Error crítico en push"
        exit 1
    }
    echo "✅ Force push exitoso"
fi

echo "🎉 Sincronización de production completada exitosamente"

# Volver a la rama original
git checkout "$CURRENT_BRANCH" 2>/dev/null || true
echo "📍 Regresando a rama: $CURRENT_BRANCH"
