# Roadmap: v1.1 Configuración del Sistema

**Milestone:** v1.1
**Created:** 2025-03-11

## Overview

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 1 | Datos del Negocio | Pantalla de configuración del negocio | BIZ-01 to BIZ-06 | 6 |
| 2 | Gestión de Usuarios | CRUD de usuarios con roles y permisos | USER-01 to USER-06, PERM-01 to PERM-04 | 10 |
| 3 | Categorías | CRUD de categorías con jerarquía | CAT-01 to CAT-07 | 7 |

**Total: 3 phases | 23 requirements**

---

## Phase 1: Datos del Negocio

**Goal:** Implementar pantalla de configuración de datos del negocio

**Requirements:**
- BIZ-01: Ver datos actuales del negocio
- BIZ-02: Editar nombre del negocio
- BIZ-03: Editar dirección
- BIZ-04: Editar RIF con validación venezolana
- BIZ-05: Editar teléfono
- BIZ-06: Subir/cambiar logo

**Success Criteria:**
1. ✅ Usuario puede ver formulario con datos actuales
2. ✅ Nombre se guarda y muestra correctamente
3. ✅ Dirección se guarda y muestra correctamente
4. ✅ RIF valida formato venezolano (letra + 8 dígitos)
5. ✅ Teléfono se guarda y muestra correctamente
6. ✅ Logo se puede subir y preview funciona

---

## Phase 2: Gestión de Usuarios

**Goal:** Implementar gestión de usuarios con roles y permisos

**Requirements:**
- USER-01: Ver lista de usuarios
- USER-02: Crear nuevo usuario
- USER-03: Editar usuario existente
- USER-04: Desactivar usuario (soft-delete)
- USER-05: Asignar rol
- USER-06: Cambiar contraseña
- PERM-01: Verificar permisos antes de acciones
- PERM-02: Cajero no puede eliminar usuarios
- PERM-03: Cajero no puede crear cajeros
- PERM-04: Solo admin puede crear admins

**Success Criteria:**
1. ✅ Tabla muestra todos los usuarios activos
2. ✅ Formulario de creación funciona
3. ✅ Edición de usuario funciona
4. ✅ Soft-delete marca usuario como inactivo
5. ✅ Selector de rol funciona
6. ✅ Cambio de contraseña funciona
7. ✅ Acciones forbidden muestran error
8. ✅ Permisos se verifican en backend

---

## Phase 3: Categorías de Productos

**Goal:** Implementar gestión de categorías con soporte jerárquico

**Requirements:**
- CAT-01: Ver lista de categorías
- CAT-02: Crear nueva categoría
- CAT-03: Editar categoría existente
- CAT-04: Eliminar categoría (soft-delete)
- CAT-05: Categoría puede tener padre (jerarquía)
- CAT-06: Categoría puede tener color
- CAT-07: Categoría puede tener icono

**Success Criteria:**
1. ✅ Lista muestra todas las categorías
2. ✅ Crear categoría funciona
3. ✅ Editar categoría funciona
4. ✅ Soft-delete funciona
5. ✅ Crear subcategoría funciona
6. ✅ Selector de color funciona
7. ✅ Selector de icono funciona

---

## Execution Notes

- **Phase 1 y 2** pueden ejecutarse en paralelo si hay recursos
- **Phase 3** requiere Phase 1 por uso de componentes compartidos
- **Soft-delete** es obligatorio para todas las entidades

---
*Roadmap created: 2025-03-11*
