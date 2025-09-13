# Reglas del Sistema de Colores y Componentes UI

## Principio Fundamental: Sin Colores Explícitos

### REGLA PRINCIPAL
**NUNCA usar colores explícitos en clases CSS como text-gray-900, bg-white, text-red-600, bg-blue-50, etc. Dejar que Tailwind CSS elija automáticamente los colores correctos según el tema.**

### Colores de Emergencia Permitidos
**SOLO usar estos colores para indicar estados críticos del sistema:**
- `text-error` - Para errores reales (errores de conexión, errores de API, stock sin existencias)
- `text-warning` - Para advertencias (tasas de cambio no cargadas, stock bajo)
- `text-success` - Para estados exitosos (conexión establecida, datos cargados, stock normal)

### Colores Permitidos SOLO en Componentes UI
**SOLO usar estos colores del sistema de Nuxt UI para componentes específicos (UButton, UBadge, UAlert):**
- "primary" - Color principal de la aplicación
- "secondary" - Color secundario de la aplicación
- "success" - Para estados exitosos
- "warning" - Para advertencias
- "error" - Para errores
- "info" - Para información
- "neutral" - Para elementos neutros

## Reglas de Implementación de Modales Nuxt UI v3

### REGLA CRÍTICA: Sintaxis Correcta de Modales
SIEMPRE usar la sintaxis correcta de Nuxt UI v3 para modales:

```vue
<UModal v-model:open="isModalOpen">
  <template #content>
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Título del Modal</h3>
      </template>
      <!-- Contenido -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="outline" @click="isModalOpen = false">Cancelar</UButton>
          <UButton color="primary" @click="handleSubmit">Confirmar</UButton>
        </div>
      </template>
    </UCard>
  </template>
</UModal>
```

#### NUNCA usar

```vue
<!-- v-model en lugar de v-model:open -->
<UModal v-model="isModalOpen">

<!-- Sin template #content -->
<UModal v-model:open="isModalOpen">
  <UCard>
    <!-- contenido directamente -->
  </UCard>
</UModal>

<!-- Slots anidados complejos -->
<UModal v-model:open="isModalOpen">
  <template #content>
    <template #header>
      <!-- NO hacer esto -->
    </template>
  </template>
</UModal>
```

### Reglas Específicas de Modales
1. Control de Visibilidad: SIEMPRE usar `v-model:open="variable"`
2. Estructura de Contenido: SIEMPRE envolver el contenido en `<template #content>`
3. UCard Interno: SIEMPRE usar `UCard` dentro del `#content`
4. Slots de UCard: Usar `#header`, `#footer` directamente en `UCard`, NO anidados
5. Sin Propiedades UI: NO usar `:ui` en `UModal`

## Ejemplos de Colores Correctos

```vue
<UBadge color="primary">Activo</UBadge>
<UButton color="success">Confirmar</UButton>
<UAlert color="error" title="Error" description="Operación fallida" />
```

```vue
<div class="p-4 rounded-lg border">
  <h3 class="font-medium mb-2">Título</h3>
  <p class="text-sm opacity-75">Descripción del contenido</p>
  <span class="font-bold">Precio</span>
  <div v-if="error" class="text-error">Error de conexión</div>
  <div v-if="warning" class="text-warning">Stock bajo</div>
  <div v-if="success" class="text-success">Operación exitosa</div>
  <div class="hover:opacity-75">Hover</div>
  <div class="rounded-lg border p-4 shadow-sm">Card</div>
  <div class="border-dashed border-2">Borde</div>
  <div class="opacity-50">Texto terciario</div>
  <div class="opacity-25">Deshabilitado</div>
  <!-- Nunca usar text-gray-900, bg-white, etc. -->
</div>
```

## Verificación Final
1. ¿Es un color del sistema de Nuxt UI?
2. ¿Mantiene la consistencia con el resto de la aplicación?
3. ¿Funciona en modo claro y oscuro?
4. ¿Usa la sintaxis correcta de modales (`v-model:open` y `#content` con `UCard`)?
5. ¿Evita colores explícitos en clases Tailwind?

