#!/bin/bash

# Script para sincronizar la rama production con main de manera robusta
# Maneja conflictos de merge y problemas de push

set -e

echo "🔄 Iniciando sincronización de rama production..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Configurar Git si no está configurado
git config --global user.name "GitHub Actions Bot" || true
git config --global user.email "github-actions-bot@users.noreply.github.com" || true
git config --global --add safe.directory "$(pwd)" || true

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"

# Crear o cambiar a la rama production
if ! git show-ref --quiet refs/heads/production; then
    echo "🆕 Creando rama production..."
    git checkout -b production
else
    echo "🔄 Cambiando a rama production..."
    git checkout production
fi

# Obtener los últimos cambios del remoto
echo "📥 Obteniendo cambios del remoto..."
git fetch origin

# Verificar si hay conflictos con la rama remota
if git show-ref --quiet refs/remotes/origin/production; then
    echo "🔍 Verificando estado de la rama production remota..."
    
    # Intentar hacer merge con la rama remota
    if ! git merge origin/production --no-edit; then
        echo "⚠️  Conflicto de merge detectado. Resolviendo automáticamente..."
        
        # En caso de conflicto, usar la versión de main (nuestra versión)
        git checkout --ours .
        git add .
        git commit -m "chore: resolve merge conflict using main branch version" || true
    fi
fi

# Hacer merge con main
echo "🔄 Sincronizando con rama main..."
if ! git merge origin/main --no-edit; then
    echo "⚠️  Conflicto de merge con main. Resolviendo automáticamente..."
    
    # En caso de conflicto, usar la versión de main
    git checkout --ours .
    git add .
    git commit -m "chore: resolve merge conflict with main branch" || true
fi

# Actualizar archivos de producción
echo "📝 Actualizando archivos de producción..."

# Crear directorio public si no existe
mkdir -p public

# Copiar CHANGELOG.md si existe
if [ -f "CHANGELOG.md" ]; then
    cp CHANGELOG.md public/CHANGELOG.md
    echo "✅ CHANGELOG.md copiado a public/"
fi

# Actualizar version.json
if [ -f "scripts/update-version.ts" ]; then
    echo "🔄 Actualizando version.json..."
    pnpm tsx scripts/update-version.ts || echo "⚠️  No se pudo actualizar version.json"
fi

# Agregar archivos de producción al commit
git add -f public/CHANGELOG.md public/version.json 2>/dev/null || true

# Hacer commit si hay cambios
if ! git diff --cached --quiet; then
    git commit -m "chore: sync production with main (auto)" || true
fi

# Configurar URL del remoto con token si está disponible
if [ -n "$GH_TOKEN" ]; then
    echo "🔐 Configurando autenticación con token..."
    git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\)\.git.*/\1/').git"
fi

# Intentar push con diferentes estrategias
echo "📤 Enviando cambios al remoto..."

# Estrategia 1: Push normal
if git push origin production; then
    echo "✅ Push exitoso con estrategia normal"
else
    echo "⚠️  Push normal falló. Intentando con force-with-lease..."
    
    # Estrategia 2: Force with lease (más seguro que force)
    if git push --force-with-lease origin production; then
        echo "✅ Push exitoso con force-with-lease"
    else
        echo "⚠️  Force-with-lease falló. Intentando con force..."
        
        # Estrategia 3: Force (último recurso)
        if git push --force origin production; then
            echo "✅ Push exitoso con force"
        else
            echo "❌ Error: No se pudo hacer push a la rama production"
            exit 1
        fi
    fi
fi

# Verificar que los archivos de producción estén presentes
echo "🔍 Verificando archivos de producción..."
if [ -f "public/CHANGELOG.md" ]; then
    echo "✅ public/CHANGELOG.md presente"
else
    echo "⚠️  public/CHANGELOG.md no encontrado"
fi

if [ -f "public/version.json" ]; then
    echo "✅ public/version.json presente"
else
    echo "⚠️  public/version.json no encontrado"
fi

echo "🎉 Sincronización de rama production completada exitosamente"

# Volver a la rama original
if [ "$CURRENT_BRANCH" != "production" ]; then
    echo "🔄 Volviendo a rama $CURRENT_BRANCH..."
    git checkout "$CURRENT_BRANCH"
fi
