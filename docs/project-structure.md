# 📁 Estructura del Proyecto

El proyecto está construido con Nuxt 4 (full‑stack) y Tauri 2. Se emplea TypeScript estricto, Zod para validación, Nuxt UI + Tailwind para UI, y Vitest para tests.

## Directorios principales

```
app/                 # App Nuxt 4 (páginas, componentes, composables, plugins)
  assets/
  components/        # Componentes Vue (incluye NotificationContainer)
  composables/       # Lógica reutilizable (useUser, useNotifications, etc.)
  database/          # Conexión y esquemas de BD (Drizzle ORM)
  layouts/           # Layouts de aplicación (default, pos, home)
  pages/             # Páginas de la aplicación
  plugins/           # Plugins de inicialización (user.client.ts, etc.)
  schemas/           # Esquemas Zod de dominio

src-tauri/           # Proyecto Tauri 2 (Rust)
  capabilities/      # Capacidades/permiso del runtime
  database/migrations/  # Migraciones SQL generadas
  src/               # Entrypoint y comandos Tauri

public/              # Assets públicos (incluye version.json)
scripts/             # Scripts de utilidad (release, sync, etc.)
test/                # Setup de pruebas
```

## Convenciones

- Vue 3 + Nuxt 4 con `<script setup lang="ts">` y Composition API.
- Componentes en `PascalCase.vue` y composables `use<Name>.ts`.
- Validar toda entrada/salida con Zod en `app/schemas/` o en server API.
- Estricto: TypeScript `strict`, sin `any`; ESM; `async/await` preferido.
- Lint: `@antfu/eslint-config` y `pnpm lint`.

## Datos y backend

- ORM: Drizzle ORM con SQLite. Esquemas en `app/database/schema/`.
- Conexión y helpers en `app/database/connection.ts` y composables.
- Migraciones en `src-tauri/database/migrations/`.
- **16 tablas**: users, products, sales, customers, exchange_rates, etc.
- **APIs externas**: BCV y DolarToday para tasas de cambio.
- **Sistema de usuarios**: Roles, sesiones y persistencia.

## UI

- Nuxt UI 3, Tailwind, diseño responsive mobile‑first.
- Íconos con Nuxt Icons, imágenes con `<NuxtImage>/<NuxtPicture>`.
- **Sistema de notificaciones**: NotificationContainer con animaciones.
- **Modales**: Sintaxis correcta Nuxt UI v3 (`v-model:open` + `#content`).

## Composables Principales

- **useUser**: Gestión de usuarios/cajeros con roles
- **useNotifications**: Sistema de notificaciones en tiempo real
- **useCurrency**: APIs de tasas de cambio (BCV, DolarToday)
- **useDatabase**: Operaciones CRUD con SQLite
- **usePOS**: Lógica del punto de venta
- **useCashClosing**: Gestión de cierre de caja

Consulta también `ESTADO-ACTUAL-PROYECTO.md` y `ROADMAP-TAREAS-DESARROLLO.md`.
