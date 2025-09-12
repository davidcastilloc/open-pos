# 🖥️ Integración Tauri 2

La aplicación se ejecuta como desktop app usando Tauri 2.

## Plugins usados

- `@tauri-apps/plugin-fs` — Archivos
- `@tauri-apps/plugin-notification` — Notificaciones
- `@tauri-apps/plugin-os` — Información del SO
- `@tauri-apps/plugin-shell` — Comandos del sistema
- `@tauri-apps/plugin-store` — Almacenamiento clave-valor
- `@tauri-apps/plugin-sql` — Acceso SQL (si aplica)

Capacidades: `src-tauri/capabilities/main.json`.

## Desarrollo

```bash
pnpm tauri:dev
```

## Build

```bash
pnpm tauri:build      # producción
pnpm tauri:build:debug
```

Requisitos de Rust por SO: ver `https://v2.tauri.app/start/prerequisites`.

## Buenas prácticas

- Encapsular llamadas Tauri en composables Nuxt. Ejemplo:

```ts
// app/composables/useReadFile.ts
import { readTextFile } from '@tauri-apps/plugin-fs'
export async function useReadFile(path: string) {
  return await readTextFile(path)
}
```

