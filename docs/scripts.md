# 🧰 Comandos y Scripts

## Comandos pnpm

```bash
pnpm dev               # Nuxt dev
pnpm tauri:dev         # App desktop en desarrollo
pnpm build             # Build Nuxt
pnpm tauri:build       # Build Tauri producción
pnpm tauri:build:debug # Build Tauri debug
pnpm lint              # Lint
pnpm type-check        # Tipos
pnpm test              # Tests
pnpm test:ui           # UI de Vitest
pnpm db:generate       # Generar migraciones Drizzle
pnpm db:migrate        # Aplicar migraciones
pnpm db:studio         # Studio visual
pnpm bump              # Bump de versión local
pnpm test:semantic-release
```

## Scripts del repositorio

- `scripts/test-semantic-release.js` — prueba configuración de releases
- `scripts/sync-production-branch.sh` — sincroniza rama `production`
- `scripts/update-version.ts` — actualiza `public/version.json`
- `scripts/db-utils.js`, `scripts/simple-db.js` — utilidades de BD
