# PLAN.md — Phase 1: Datos del Negocio

**Phase:** 1
**Goal:** Implementar pantalla de configuración de datos del negocio
**Created:** 2025-03-11

## Requirements

- **BIZ-01**: Ver datos actuales del negocio
- **BIZ-02**: Editar nombre del negocio
- **BIZ-03**: Editar dirección
- **BIZ-04**: Editar RIF con validación venezolana
- **BIZ-05**: Editar teléfono
- **BIZ-06**: Subir/cambiar logo

## Success Criteria

1. ✅ Usuario puede ver formulario con datos actuales
2. ✅ Nombre se guarda y muestra correctamente
3. ✅ Dirección se guarda y muestra correctamente
4. ✅ RIF valida formato venezolano (letra + 8 dígitos)
5. ✅ Teléfono se guarda y muestra correctamente
6. ✅ Logo se puede subir y preview funciona

## Tasks

### Task 1: Extender useConfig para datos del negocio

**Requirements:** BIZ-01, BIZ-02, BIZ-03, BIZ-04, BIZ-05
**File:** `app/composables/useBusiness.ts` (nuevo)
**Description:** Crear composable que extienda useConfig para datos del negocio

**Acceptance Criteria:**
- [ ] `useBusiness()` existe y exporta `businessConfig`, `updateBusiness()`, `validateRIF()`
- [ ] `validateRIF()` valida RIF venezolano: `/^[JVE]-\d{8}$/i`
- [ ] Datos se guardan en categoría "business" de useConfig

**Implementation:**
```typescript
export function useBusiness() {
  const { getConfig, updateConfig } = useConfig();
  
  const businessConfig = computed(() => getConfig('business'));
  
  const updateBusiness = async (data: BusinessData) => {
    await updateConfig('business', 'data', data);
  };
  
  const validateRIF = (rif: string): boolean => {
    const pattern = /^[JVE]-\d{8}$/i;
    return pattern.test(rif);
  };
  
  return { businessConfig, updateBusiness, validateRIF };
}
```

### Task 2: Crear endpoint de API para datos del negocio

**Requirements:** BIZ-01, BIZ-02, BIZ-03, BIZ-04, BIZ-05
**File:** `app/server/api/settings/business.ts` (nuevo)
**Description:** Endpoint GET/PUT para datos del negocio

**Acceptance Criteria:**
- [ ] GET `/api/settings/business` devuelve datos actuales
- [ ] PUT `/api/settings/business` actualiza datos con validación
- [ ] Valida RIF antes de guardar

### Task 3: Crear componente BusinessForm

**Requirements:** BIZ-01, BIZ-02, BIZ-03, BIZ-04, BIZ-05
**File:** `app/components/settings/BusinessForm.vue` (nuevo)
**Description:** Formulario con campos para datos del negocio

**Acceptance Criteria:**
- [ ] Campos: Nombre, Dirección, RIF, Teléfono
- [ ] Validación de RIF con feedback visual
- [ ] Botón Guardar que llama a useBusiness
- [ ] Carga datos iniciales al montar

**Implementation:**
```vue
<template>
  <UForm :schema="schema" :state="state" @submit="handleSubmit">
    <UFormGroup label="Nombre" name="name">
      <UInput v-model="state.name" />
    </UFormGroup>
    <!-- ... otros campos ... -->
  </UForm>
</template>
```

### Task 4: Crear vista de configuración del negocio

**Requirements:** BIZ-01 a BIZ-06
**File:** `app/pages/settings/business.vue` (nuevo)
**Description:** Página de configuración de datos del negocio

**Acceptance Criteria:**
- [ ] Incluye BusinessForm
- [ ] Muestra mensaje de éxito/error
- [ ] Carga datos al montar

### Task 5: Implementar upload de logo

**Requirements:** BIZ-06
**File:** `app/components/settings/LogoUpload.vue` (nuevo)
**Description:** Componente para subir/cambiar logo del negocio

**Acceptance Criteria:**
- [ ] Botón "Subir logo" con input file oculto
- [ ] Preview del logo actual
- [ ] Validación de tipo de archivo (PNG, JPG)
- [ ] Guardar ruta del archivo en base de datos

**Implementation:**
```typescript
import { open } from '@tauri-apps/plugin-dialog';
import { writeBinaryFile } from '@tauri-apps/plugin-fs';

const uploadLogo = async () => {
  const selected = await open({
    filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
  });
  
  if (selected) {
    const data = await readBinaryFile(selected);
    const path = `business/logo.png`;
    await writeBinaryFile(path, data);
    await updateBusiness({ logoPath: path });
  }
};
```

### Task 6: Agregar ruta de negocio a menú configuración

**Requirements:** BIZ-01
**File:** `app/pages/settings/index.vue` (modificar)
**Description:** Agregar enlace a "Datos del Negocio"

**Acceptance Criteria:**
- [ ] Enlace visible en dashboard de configuración
- [ ] Navega a `/settings/business`

### Task 7: Pruebas unitarias

**Requirements:** BIZ-01 a BIZ-06
**File:** `test/business.test.ts` (nuevo)
**Description:** Pruebas para validaciones y componentes

**Acceptance Criteria:**
- [ ] `validateRIF()` pasa con RIF válido
- [ ] `validateRIF()` falla con RIF inválido
- [ ] Formulario guarda datos correctamente

---

## Execution Order

```
Task 1 → Task 2 → [Task 3, Task 4 en paralelo] → Task 5 → Task 6 → Task 7
```

## Dependencies

- **Blocker:** Uso de `useConfig` ya existente en el codebase ✓
- **Blocker:** Nuxt UI instalado ✓
- **Blocker:** Tauri plugins (fs, dialog) disponibles ✓

---

*Plan created: 2025-03-11*
*Estimated time: 2-3 días*
