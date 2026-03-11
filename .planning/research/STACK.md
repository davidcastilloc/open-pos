# Stack Research

**Domain:** Sistema POS - Configuración (Datos del negocio, Usuarios, Categorías)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Ya en el proyecto)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Nuxt UI | ^3.3.3 | Componentes de formulario | Integración nativa con Zod via Standard Schema, validación automática en UForm |
| Zod | ^4.0.5 | Validación de esquemas | Ya en uso, integración completa con Nuxt UI |
| Pinia + @pinia/nuxt | latest | Estado global | Ya en uso, ideal para auth/user state |
| Drizzle ORM | ^0.44.5 | ORM para SQLite | Ya en uso, tipos seguros para schemas de usuarios/roles |
| @tauri-apps/plugin-store | ^2.x | Persistencia key-value | Ya en uso, configuración del negocio |

### Nuevas Adiciones Requeridas

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @tauri-apps/plugin-fs | ^2.x | Manipulación de archivos | Necesario para guardar/logo del negocio en sistema local |
| @tauri-apps/plugin-dialog | ^2.x | Dialogs nativos | Selector de archivo para logo, confirmaciones |

### Implementación de RBAC (Roles y Permisos)

| Approach | Purpose | Implementation |
|----------|---------|----------------|
| Composables + Pinia | Estado de permisos | `useUser()` store con roles |
| Vue Router guards | Protección de rutas | Navigation guards con `beforeEach` |
| Zod enums | Definición de roles | Validación de tipos |

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | ^12.x | Utilidades Vue | Funciones como `useFileReader`, `useStorage` |
| @nuxt/ui (existente) | ^3.3.3 | UForm, UFormField, UInput, USelect, UModal | Todos los forms de configuración |

## Installation

```bash
# Plugins Tauri necesarios (verificar si ya están instalados)
pnpm tauri add fs
pnpm tauri add dialog

# Verificar si ya están en package.json
# @tauri-apps/plugin-store (ya debe estar)
# @tauri-apps/plugin-fs
# @tauri-apps/plugin-dialog
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Nuxt UI Forms | Vue Formulate | Nuxt UI ya está en proyecto, mejor integración |
| Tauri plugin-store | LocalStorage/IndexedDB | plugin-store es más seguro y portable en Tauri |
| Zod | Yup/Valibot | Zod ya está en proyecto |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Vuex | Deprecated, proyecto usa Pinia | Pinia (ya en uso) |
| vue-i18n interno | El proyecto maneja i18n de otra forma | Revisar docs existentes |
| Auth módulos externos (nuxt-auth) | Proyecto no tiene backend, offline-first | Implementación custom con Pinia + Tauri store |

## Stack Patterns by Variant

**Si el negocio requiere facturación electrónica futura:**
- Considerar integración con servicios externos
- La configuración de RIF/teléfono está pensada para esto

**Si se requiere multi-tenancy:**
- Agregar campo `business_id` a todas las tablas
- Modificar Drizzle schemas desde ahora

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Nuxt UI 3.x | Nuxt 4, Vue 3.5+ | Verificar versión exacta en package.json |
| Zod 4.x | Nuxt UI 3.x | Standard Schema support |
| Drizzle ORM 0.44.x | better-sqlite3, @tauri-apps/plugin-sql | Ya configurado |
| Tauri plugins 2.x | Tauri 2.6+ | Verificar en src-tauri/Cargo.toml |

## Implementation Notes

### Datos del Negocio
- Usar `@tauri-apps/plugin-store` para persistencia rápida (nombre, RIF, teléfono)
- Usar `@tauri-apps/plugin-fs` + `@tauri-apps/plugin-dialog` para logo (guardar en app data dir)
- Crear schema Drizzle para backup en SQLite si se necesita query advanced

### Gestión de Usuarios
- Drizzle: tablas `users`, `roles`, `user_roles`
- Pinia store: `useAuthStore` con user actual, roles, permisos
- Zod: esquemas de validación para create/update user
- Route guards: proteger /config/* según rol

### Gestión de Categorías
- Drizzle: tabla `categories` (id, name, description, parent_id, business_id)
- CRUD standard con Nuxt UI + Drizzle queries
- tree structure si hay subcategorías

## Sources

- Context7: `/nuxt/ui` — Form validation con Zod, Standard Schema
- Tauri Docs: `@tauri-apps/plugin-store`, `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-dialog`
- WebSearch: RBAC patterns Vue 3 + Pinia (Medium articles 2025-2026)
- Existing codebase: `.planning/codebase/STACK.md` — tecnologías actuales del proyecto

---

*Stack research for: POS Configuration System*
*Researched: 2026-03-11*
