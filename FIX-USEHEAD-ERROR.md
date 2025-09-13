# Solución del Error useHead() sin Contexto

## 🐛 Problema Identificado

Se estaba produciendo el siguiente error:
```
useHead() was called without provide context, ensure you call it through the setup() function.
```

El error provenía del plugin de colores de `@nuxt/ui` pero era causado por un uso incorrecto de `useHead()` en nuestro código.

## 🔍 Causa Raíz

El problema estaba en el archivo `app/layouts/pos.vue` donde se estaba llamando a `useHead()`:

```vue
// ❌ INCORRECTO - Los layouts no deben usar useHead()
useHead({
  title: "POS Venezuela - Punto de Venta"
})
```

Los layouts en Nuxt 4 no tienen el contexto apropiado para ejecutar `useHead()` ya que no son componentes de página completos.

## ✅ Solución Implementada

### 1. Eliminación de useHead() del Layout

Se eliminó el código problemático del archivo `app/layouts/pos.vue` (líneas 186-189).

### 2. Creación de Regla de Prevención

Se creó una nueva regla en `.cursor/rules/40-usehead-context.mdc` que documenta:
- Dónde se PUEDE usar `useHead()` (páginas, componentes, app.vue)
- Dónde NO se debe usar (layouts, plugins, fuera del setup)
- Alternativas y mejores prácticas
- Guía de debugging para futuros problemas

## 📋 Verificación

1. ✅ Se eliminó el `useHead()` del layout problemático
2. ✅ Se verificó que no hay otros layouts con el mismo problema
3. ✅ No hay errores de linting en los archivos modificados
4. ✅ El servidor de desarrollo inicia correctamente

## 🎯 Prevención Futura

La regla creada ayudará a prevenir este tipo de errores mediante:

1. **Documentación clara** de dónde usar y no usar `useHead()`
2. **Ejemplos prácticos** de uso correcto e incorrecto
3. **Alternativas** para casos especiales (plugins, layouts, composables)
4. **Checklist de validación** antes de usar la función
5. **Guía de debugging** para identificar y solucionar problemas

## 📝 Archivos Modificados

- `app/layouts/pos.vue` - Eliminado uso incorrecto de useHead()
- `.cursor/rules/40-usehead-context.mdc` - Nueva regla de prevención

## 🚀 Próximos Pasos

Si necesitas establecer meta tags para páginas que usan el layout `pos`, hazlo directamente en cada página:

```vue
<!-- En pages/pos.vue o cualquier página que use el layout -->
<script setup lang="ts">
	useHead({
		title: "POS - Punto de Venta"
	});
</script>
```

El error debería estar completamente resuelto y no volverá a ocurrir siguiendo las reglas establecidas.
