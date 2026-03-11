# 🧰 Comandos y Scripts

## Comandos pnpm

```bash
pnpm install           # Instala dependencias y ejecuta nuxt prepare
pnpm dev               # Nuxt dev
pnpm tauri:dev         # App desktop en desarrollo
pnpm tauri:check:linux # Verifica prerequisitos Linux para Tauri (glib/pkg-config/webkit)
pnpm generate          # Genera salida web estática (Nuxt)
pnpm tauri:build       # Build Tauri producción
pnpm tauri:build:debug # Build Tauri debug
pnpm lint              # Lint
pnpm type-check        # Tipos
pnpm test              # Tests
pnpm test:ui           # UI de Vitest
pnpm db:generate       # Generar migraciones Drizzle
pnpm db:migrate        # Aplicar migraciones
pnpm db:studio         # Studio visual
pnpm rebuild better-sqlite3 # Recompilar dependencia nativa SQLite (si falla db:migrate)
pnpm approve-builds    # Aprobar nuevas dependencias con scripts nativos (uso puntual)
pnpm bump              # Bump de versión local
pnpm test:semantic-release
```

## Scripts del repositorio

- `scripts/test-semantic-release.js` — prueba configuración de releases
- `scripts/sync-production-branch.sh` — sincroniza rama `production`
- `scripts/update-version.ts` — actualiza `public/version.json`
- `scripts/db-utils.js`, `scripts/simple-db.js` — utilidades de BD
- `scripts/check-tauri-linux-prereqs.sh` — chequeo de prerequisitos Linux para ejecutar Tauri
