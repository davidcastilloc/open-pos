# PLAN.md — Phase 1a: Datos del Negocio

**Phase:** 1a
**Goal:** Implementar configuración de datos del negocio (nombre, RIF, dirección, teléfono)
**Created:** 2025-03-11

## Requirements (BIZ-01 to BIZ-05)

- BIZ-01: Ver datos actuales del negocio
- BIZ-02: Editar nombre del negocio
- BIZ-03: Editar dirección
- BIZ-04: Editar RIF con validación venezolana
- BIZ-05: Editar teléfono

## Success Criteria

1. ✅ Usuario puede ver formulario con datos actuales
2. ✅ Nombre se guarda y muestra correctamente
3. ✅ Dirección se guarda y muestra correctamente
4. ✅ RIF valida formato venezolano (letra + 8 dígitos)
5. ✅ Teléfono se guarda y muestra correctamente

## Tareas

### T1: Extender useConfig para datos del negocio

**File:** `app/composables/useBusiness.ts` (nuevo)
**Action:** Crear composable que extienda useConfig
**Verify:** `validateRIF()` valida `/^[JVE]-\d{8}$/i`
**Done:** Datos se guardan en categoría "business"

### T2: Endpoint API para datos del negocio

**File:** `app/server/api/settings/business.ts` (nuevo)
**Action:** Endpoint GET/PUT con validación de RIF
**Verify:** GET devuelve datos, PUT actualiza con validación
**Done:** API responde correctamente

### T3: Componente BusinessForm

**File:** `app/components/settings/BusinessForm.vue` (nuevo)
**Action:** Formulario con campos y validación Zod
**Verify:** Campos funcionan, validación de RIF muestra error
**Done:** Formulario guarda datos correctamente

### T4: Vista de configuración del negocio

**File:** `app/pages/settings/business.vue` (nuevo)
**Action:** Página con BusinessForm y feedback
**Verify:** Datos cargan al montar, mensaje de éxito
**Done:** Página navega correctamente

### T5: Enlace en dashboard configuración

**File:** `app/pages/settings/index.vue` (modificar)
**Action:** Agregar enlace a "Datos del Negocio"
**Verify:** Enlace visible y navega a `/settings/business`
**Done:** Navegación funciona

---

## Commit Strategy

1. **Task 1**: `feat: useBusiness composable for business data`
2. **Task 2**: `feat: business settings API endpoint`
3. **Task 3**: `feat: BusinessForm component with validation`
4. **Task 4**: `feat: business settings page`
5. **Task 5**: `feat: add business settings link to dashboard`

## Execution Order

```
T1 → T2 → [T3, T4] → T5
```

---

*Plan created: 2025-03-11*
