# Architecture Research

**Domain:** Configuración del Sistema POS (Datos del negocio, Usuarios, Categorías)
**Researched:** 2025-03-11
**Confidence:** HIGH

## Sistema Existente

El proyecto ya cuenta con:
- **Nuxt 4 + Tauri 2** - Frontend y escritorio
- **SQLite + Drizzle** - Base de datos
- **Composables existentes:**
  - `useConfig.ts` - Configuración con categorías (general, currency, accounts, taxes, reports, integrations)
  - `useUser.ts` - CRUD de usuarios con roles (admin, cashier)

## Estructura Recomendada

```
app/
├── composables/
│   ├── useConfig.ts      (YA EXISTE - expandir)
│   ├── useUser.ts        (YA EXISTE - expandir)
│   ├── useCategory.ts    (NUEVO)
│   └── useBusiness.ts   (NUEVO - datos del negocio)
├── pages/
│   └── settings/
│       ├── index.vue        (Dashboard de configuración)
│       ├── business.vue     (Datos del negocio)
│       ├── users.vue        (Gestión de usuarios)
│       └── categories.vue   (Gestión de categorías)
├── components/
│   └── settings/
│       ├── BusinessForm.vue
│       ├── UserForm.vue
│       ├── UserTable.vue
│       ├── CategoryForm.vue
│       └── CategoryTree.vue
└── server/
    └── api/
        └── settings/
            ├── business.ts
            ├── users/
            │   ├── index.ts
            │   └── [id].ts
            └── categories/
                ├── index.ts
                └── [id].ts
```

## Componentes y Responsabilidades

| Componente | Responsabilidad | Implementación |
|------------|-----------------|----------------|
| useBusiness | Datos del negocio (nombre, RIF, dirección, logo) | Extender useConfig |
| useCategory | CRUD categorías con jerarquía | Nuevo composable |
| useUser | Gestión de usuarios y roles | YA EXISTE - expandir |
| Settings index | Dashboard central de configuración | Nueva página |
| BusinessForm | Formulario de datos del negocio | Nuevo componente |
| UserForm | Formulario crear/editar usuario | Nuevo componente |
| CategoryTree | Vista jerárquica de categorías | Nuevo componente |

## Patrones Recomendados

### 1. Extender Composables Existentes

**What:**复用 existentes en lugar de crear desde cero
**When to use:** Cuando la funcionalidad ya existe parcialmente
**Trade-offs:** 
- ✅ Menos código duplicado
- ✅ Consistencia con el codebase
- ⚠️ Puede acoplar funcionalidades

**Example:**
```typescript
// Extender useConfig para negocio
export function useBusiness() {
  const { getConfig, updateConfig } = useConfig();
  
  const businessConfig = computed(() => getConfig('business'));
  
  const updateBusiness = async (data: BusinessData) => {
    await updateConfig('business', 'data', data);
  };
  
  return { businessConfig, updateBusiness };
}
```

### 2. Soft-Delete para Entidades

**What:** No eliminar físicamente registros, marcar como inactivos
**When to use:** Para usuarios y categorías (datos históricos)
**Trade-offs:**
- ✅ Mantiene integridad referencial
- ✅ Historial completo
- ⚠️ Más espacio en BD

**Example:**
```typescript
// En lugar de DELETE, usar is_active = 0
await execute(
  'UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?',
  [new Date().toISOString(), id]
);
```

### 3. RBAC (Control de Acceso Basado en Roles)

**What:** Verificar permisos antes de cada acción
**When to use:** Siempre, especialmente en gestión de usuarios
**Trade-offs:**
- ✅ Seguridad
- ✅ Flexibilidad
- ⚠️ Complejidad adicional

**Example:**
```typescript
// Middleware de permisos
const canEditUser = (currentUser: User, targetUser: User) => {
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'manager' && targetUser.role !== 'admin') return true;
  return false;
};
```

### 4. Validación con Zod

**What:** Usar Zod para validación de datos
**When to use:** En todos los formularios
**Trade-offs:**
- ✅ Type-safe
- ✅ Validación declarativa
- ⚠️ Curva de aprendizaje

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ BusinessForm│  │  UserForm   │  │CategoryTree │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                    Composables Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │useBusiness  │  │  useUser    │  │useCategory  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │/settings/   │  │  /users/    │  │/categories/ │         │
│  │ business    │  │             │  │             │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  config    │  │   users    │  │ categories  │         │
│  │  (SQLite)  │  │  (SQLite)  │  │  (SQLite)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Integración con Código Existente

### useConfig (YA EXISTE)
- **Extender** con categoría "business" para datos del negocio
- Agregar validación de RIF venezolano

### useUser (YA EXISTE)
- **Expandir** con:
  - Permisos granulares
  - Auditoría de acciones
  - Cambiar contraseña
  - Session management

### useCategory (NUEVO)
- Crear similar a useUser
- Soporte para jerarquía (parent_id)
- Ordenamiento y tree-view

## Anti-Patterns

### Anti-Pattern 1: Hard Delete

**What people do:** Eliminar físicamente usuarios o categorías
**Why it's wrong:** Rompe reportes históricos, genera datos huérfanos
**Do this instead:** Usar soft-delete con campo `is_active` o `deleted_at`

### Anti-Pattern 2: All-Access Roles

**What people do:** Crear solo "admin" con acceso total
**Why it's wrong:** No hay control, riesgo de seguridad
**Do this instead:** Roles predefinidos (admin, manager, cashier) con permisos específicos

### Anti-Pattern 3: Skip Validation

**What people do:** Confiar en el frontend para validación
**Why it's wrong:** Frontend puede ser comprometido
**Do this instead:** Validar siempre en backend con Zod

## Consideraciones de Escalamiento

| Escenario | Arquitectura |
|-----------|--------------|
| 1 usuario | Monolito SQLite funciona bien |
| 10+ usuarios | Agregar caché, optimizar queries |
| 100+ usuarios | Considerar PostgreSQL, autenticación robusta |

**Prioridades de optimización:**
1. **Primero:** Queries en tablas grandes (products, categories)
2. **Segundo:** Sesiones y autenticación
3. **Tercero:** Cache de configuración

## Fuentes

- Documentación oficial Nuxt 4
- Documentación Drizzle ORM
- Patrones RBAC de la industria
- Best practices de POS systems

---
*Architecture research for: Configuración del Sistema POS*
*Researched: 2025-03-11*
