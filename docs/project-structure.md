# 📁 Estructura del Proyecto

El proyecto está construido con Nuxt 4 (full‑stack) y Tauri 2. Se emplea TypeScript estricto, Zod para validación, Nuxt UI + Tailwind para UI, y Vitest para tests.

## Directorios principales

```
app/                 # App Nuxt 4 (páginas, componentes, composables, plugins)
  assets/
  components/
  composables/
  database/          # Conexión y esquemas de BD (Drizzle ORM)
  pages/
  plugins/
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

## UI

- Nuxt UI 3, Tailwind, diseño responsive mobile‑first.
- Íconos con Nuxt Icons, imágenes con `<NuxtImage>/<NuxtPicture>`.

Consulta también `ESTADO-ACTUAL-PROYECTO.md` y `ROADMAP-TAREAS-DESARROLLO.md`.


