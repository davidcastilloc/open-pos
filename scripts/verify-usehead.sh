#!/bin/bash

# Script de verificación de uso correcto de useHead() en Nuxt 4
# Asegura que useHead solo se use en lugares permitidos

echo "╔══════════════════════════════════════════════════════╗"
echo "║     🔍 VERIFICACIÓN DE USO DE useHead() EN NUXT 4   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# 1. Verificar layouts
echo "🔍 Verificando layouts..."
if grep -l "useHead\|useSeoMeta\|useServerSeoMeta" app/layouts/*.vue 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Se encontró useHead en layouts (NO PERMITIDO)${NC}"
    echo "   Los layouts no deben usar useHead. Mueve el código a las páginas."
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Layouts limpios${NC}"
fi
echo ""

# 2. Verificar plugins
echo "🔍 Verificando plugins..."
if grep -l "useHead\|useSeoMeta\|useServerSeoMeta" app/plugins/*.{ts,js} 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Se encontró useHead en plugins (NO PERMITIDO)${NC}"
    echo "   Los plugins no deben usar useHead directamente. Usa hooks en su lugar."
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Plugins limpios${NC}"
fi
echo ""

# 3. Verificar composables
echo "🔍 Verificando composables..."
if grep -l "useHead\|useSeoMeta\|useServerSeoMeta" app/composables/*.{ts,js} 2>/dev/null; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Se encontró useHead en composables${NC}"
    echo "   Asegúrate de que los composables retornen funciones, no llamen useHead directamente."
fi
echo -e "${GREEN}✅ Composables verificados${NC}"
echo ""

# 4. Verificar componentes (opcional, normalmente está permitido pero mejor en páginas)
echo "🔍 Verificando componentes..."
COMPONENT_COUNT=$(find app/components -name "*.vue" -exec grep -l "useHead\|useSeoMeta\|useServerSeoMeta" {} \; 2>/dev/null | wc -l)
if [ "$COMPONENT_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Nota: Se encontró useHead en $COMPONENT_COUNT componente(s)${NC}"
    echo "   Considera mover los meta tags a las páginas para mejor organización."
    find app/components -name "*.vue" -exec grep -l "useHead\|useSeoMeta\|useServerSeoMeta" {} \; 2>/dev/null | sed 's/^/     - /'
else
    echo -e "${GREEN}✅ No hay useHead en componentes (mejor práctica)${NC}"
fi
echo ""

# 5. Mostrar uso correcto en páginas
echo "📍 useHead encontrado correctamente en páginas:"
PAGE_COUNT=$(grep -l "useHead\|useSeoMeta\|useServerSeoMeta" app/pages/*.vue 2>/dev/null | wc -l)
if [ "$PAGE_COUNT" -gt 0 ]; then
    grep -l "useHead\|useSeoMeta\|useServerSeoMeta" app/pages/*.vue 2>/dev/null | sed 's/^/  ✅ /'
    echo -e "${GREEN}Total: $PAGE_COUNT páginas con meta tags${NC}"
else
    echo -e "${YELLOW}  No se encontró useHead en ninguna página${NC}"
fi
echo ""

# 6. Resumen final
echo "╔══════════════════════════════════════════════════════╗"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "║           ${GREEN}✅ VERIFICACIÓN COMPLETADA${NC}                ║"
    echo -e "║         ${GREEN}No se encontraron errores críticos${NC}          ║"
else
    echo -e "║           ${RED}❌ VERIFICACIÓN CON ERRORES${NC}               ║"
    echo -e "║         ${RED}Se encontraron $ERRORS error(es) crítico(s)${NC}         ║"
    echo "║                                                      ║"
    echo "║  Por favor, corrige los errores antes de continuar  ║"
fi
echo "╚══════════════════════════════════════════════════════╝"

# Retornar código de error si hay problemas
exit $ERRORS
