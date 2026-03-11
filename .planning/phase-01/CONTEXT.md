## Phase 1: Datos del Negocio

**Goal:** Implementar pantalla de configuración de datos del negocio

### Requirements (BIZ-01 to BIZ-06)

- BIZ-01: Ver datos actuales del negocio
- BIZ-02: Editar nombre del negocio
- BIZ-03: Editar dirección
- BIZ-04: Editar RIF con validación venezolana
- BIZ-05: Editar teléfono
- BIZ-06: Subir/cambiar logo

### Success Criteria

1. Usuario puede ver formulario con datos actuales
2. Nombre se guarda y muestra correctamente
3. Dirección se guarda y muestra correctamente
4. RIF valida formato venezolano (letra + 8 dígitos)
5. Teléfono se guarda y muestra correctamente
6. Logo se puede subir y preview funciona

### Context

- Stack: Nuxt 4 + Tauri 2 + SQLite + Drizzle
- Existing: useConfig.ts with "business" category
- UI Framework: Nuxt UI
- Validation: Zod

### Files to Read

- .planning/PROJECT.md
- .planning/phase-01/CONTEXT.md
- app/composables/useConfig.ts (existing)