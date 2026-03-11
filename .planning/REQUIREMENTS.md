# Requirements: OpenPOS v1.1 Configuración del Sistema

**Defined:** 2025-03-11
**Core Value:** Sistema de punto de venta accesible y funcional para pequeños negocios en Venezuela

## v1 Requirements

### Datos del Negocio

- [ ] **BIZ-01**: Usuario puede ver datos actuales del negocio
- [ ] **BIZ-02**: Usuario puede editar nombre del negocio
- [ ] **BIZ-03**: Usuario puede editar dirección del negocio
- [ ] **BIZ-04**: Usuario puede editar RIF/tax ID con validación venezolana
- [ ] **BIZ-05**: Usuario puede editar teléfono de contacto
- [ ] **BIZ-06**: Usuario puede subir/cambiar logo del negocio

### Usuarios

- [ ] **USER-01**: Administrador puede ver lista de usuarios
- [ ] **USER-02**: Administrador puede crear nuevo usuario
- [ ] **USER-03**: Administrador puede editar usuario existente
- [ ] **USER-04**: Administrador puede desactivar usuario (soft-delete)
- [ ] **USER-05**: Administrador puede asignar rol (admin, manager, cashier)
- [ ] **USER-06**: Usuario puede cambiar su propia contraseña

### Permisos

- [ ] **PERM-01**: Sistema verifica permisos antes de cada acción
- [ ] **PERM-02**: Cajero no puede eliminar usuarios
- [ ] **PERM-03**: Cajero no puede crear otros cajeros
- [ ] **PERM-04**: Solo admin puede crear admins

### Categorías de Productos

- [ ] **CAT-01**: Usuario puede ver lista de categorías
- [ ] **CAT-02**: Usuario puede crear nueva categoría
- [ ] **CAT-03**: Usuario puede editar categoría existente
- [ ] **CAT-04**: Usuario puede eliminar categoría (soft-delete)
- [ ] **CAT-05**: Categoría puede tener categoría padre (jerarquía)
- [ ] **CAT-06**: Categoría puede tener color asignado
- [ ] **CAT-07**: Categoría puede tener icono asignado

## v2 Requirements

### Usuarios

- **USER-07**: Registro de auditoría de acciones de usuarios
- **USER-08**: Sesiones activas por usuario
- **USER-09**: Recuperación de contraseña por email

### Permisos

- **PERM-05**: Roles personalizados
- **PERM-06**: Permisos granulares por módulo

### Categorías

- **CAT-08**: Reordenar categorías por drag-and-drop
- **CAT-09**: Ver árbol jerárquico de categorías

## Out of Scope

| Feature | Reason |
|---------|--------|
| Facturación electrónica | Requiere integración con Seniat |
| Múltiples ubicaciones | Funcionalidad avanzada |
| Exportar configuración | No es crítico para v1 |
| Tema oscuro/claro | UI existente |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BIZ-01 | Phase 1 | Pending |
| BIZ-02 | Phase 1 | Pending |
| BIZ-03 | Phase 1 | Pending |
| BIZ-04 | Phase 1 | Pending |
| BIZ-05 | Phase 1 | Pending |
| BIZ-06 | Phase 1 | Pending |
| USER-01 | Phase 2 | Pending |
| USER-02 | Phase 2 | Pending |
| USER-03 | Phase 2 | Pending |
| USER-04 | Phase 2 | Pending |
| USER-05 | Phase 2 | Pending |
| USER-06 | Phase 2 | Pending |
| PERM-01 | Phase 2 | Pending |
| PERM-02 | Phase 2 | Pending |
| PERM-03 | Phase 2 | Pending |
| PERM-04 | Phase 2 | Pending |
| CAT-01 | Phase 3 | Pending |
| CAT-02 | Phase 3 | Pending |
| CAT-03 | Phase 3 | Pending |
| CAT-04 | Phase 3 | Pending |
| CAT-05 | Phase 3 | Pending |
| CAT-06 | Phase 3 | Pending |
| CAT-07 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2025-03-11*
*Last updated: 2025-03-11 after research synthesis*
