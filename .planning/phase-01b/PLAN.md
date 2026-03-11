# PLAN.md — Phase 1b: Logo del Negocio

**Phase:** 1b
**Goal:** Implementar upload y gestión de logo del negocio
**Created:** 2025-03-11

## Requirements (BIZ-06)

- BIZ-06: Subir/cambiar logo del negocio

## Success Criteria

1. ✅ Botón "Subir logo" con input file oculto
2. ✅ Preview del logo actual funciona
3. ✅ Validación de tipo de archivo (PNG, JPG)
4. ✅ Guardar ruta del archivo en base de datos

## Tareas

### T1: Extender useBusiness para logo

**File:** `app/composables/useBusiness.ts` (modificar)
**Action:** Agregar funciones para logo
**Verify:** `uploadLogo()`, `getLogoPath()` existen
**Done:** Logo se guarda en `business.logoPath`

### T2: Componente LogoUpload

**File:** `app/components/settings/LogoUpload.vue` (nuevo)
**Action:** Componente con preview y upload
**Verify:** Seleccionar archivo, preview, validación
**Done:** Componente emite evento de cambio

### T3: Integrar en BusinessForm

**File:** `app/components/settings/BusinessForm.vue` (modificar)
**Action:** Agregar LogoUpload al formulario
**Verify:** Logo aparece en formulario
**Done:** Formulario completo con logo

---

## Commit Strategy

1. **Task 1**: `feat: logo support in useBusiness composable`
2. **Task 2**: `feat: LogoUpload component with preview`
3. **Task 3**: `feat: integrate logo upload in BusinessForm`

## Execution Order

```
T1 → T2 → T3
```

---

*Plan created: 2025-03-11*
