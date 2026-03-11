# PLAN.md — Phase 2: Gestión de Usuarios

**Phase:** 2
**Goal:** Implementar CRUD de usuarios con roles y permisos
**Created:** 2025-03-11

## Requirements (USER-01 to USER-06, PERM-01 to PERM-04)

### Usuarios
- **USER-01**: Administrador puede ver lista de usuarios
- **USER-02**: Administrador puede crear nuevo usuario
- **USER-03**: Administrador puede editar usuario existente
- **USER-04**: Administrador puede desactivar usuario (soft-delete)
- **USER-05**: Administrador puede asignar rol (admin, manager, cashier)
- **USER-06**: Usuario puede cambiar su propia contraseña

### Permisos
- **PERM-01**: Sistema verifica permisos antes de cada acción
- **PERM-02**: Cajero no puede eliminar usuarios
- **PERM-03**: Cajero no puede crear otros cajeros
- **PERM-04**: Solo admin puede crear admins

## Success Criteria

1. ✅ Tabla muestra todos los usuarios activos
2. ✅ Formulario de creación funciona
3. ✅ Edición de usuario funciona
4. ✅ Soft-delete marca usuario como inactivo
5. ✅ Selector de rol funciona
6. ✅ Cambio de contraseña funciona
7. ✅ Acciones forbidden muestran error
8. ✅ Permisos se verifican en backend

## Tareas

### T1: Expandir useUser para gestionar lista de usuarios

**File:** `app/composables/useUser.ts` (modificar)
**Action:** Agregar funciones para CRUD de usuarios
**Verify:** `getAllUsers()`, `createUser()`, `updateUser()`, `deleteUser()` existen
**Done:** Usuarios se guardan en SQLite

### T2: Crear endpoint API de usuarios

**File:** `app/server/api/settings/users/index.ts` (nuevo)
**Action:** Endpoint GET/POST para lista/creación
**Verify:** GET devuelve lista, POST crea usuario

### T3: Crear endpoint API de usuario específico

**File:** `app/server/api/settings/users/[id].ts` (nuevo)
**Action:** Endpoint GET/PUT/DELETE para usuario
**Verify:** Operaciones CRUD funcionan

### T4: Crear componente UserForm

**File:** `app/components/settings/UserForm.vue` (nuevo)
**Action:** Formulario para crear/editar usuario
**Verify:** Campos nombre, email, rol, contraseña

### T5: Crear componente UserTable

**File:** `app/components/settings/UserTable.vue` (nuevo)
**Action:** Tabla de usuarios con acciones
**Verify:** Muestra lista, permite editar/eliminar

### T6: Crear página de gestión de usuarios

**File:** `app/pages/settings/users.vue` (nuevo)
**Action:** Página con tabla y formulario
**Verify:** CRUD completo funciona

### T7: Agregar enlace a dashboard configuración

**File:** `app/pages/settings/index.vue` (modificar)
**Action:** Agregar enlace a "Gestión de Usuarios"
**Verify:** Navegación funciona

---

## Commit Strategy

1. `feat(useUser): expandir para CRUD de usuarios`
2. `feat(settings): API endpoint para lista de usuarios`
3. `feat(settings): API endpoint para usuario específico`
4. `feat(settings): UserForm component`
5. `feat(settings): UserTable component`
6. `feat(settings): página de gestión de usuarios`
7. `feat(settings): enlace a gestión de usuarios`

## Execution Order

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

---

*Plan created: 2025-03-11*
