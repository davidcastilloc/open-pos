# 🔧 Variables de Entorno y Configuración

Ejemplo en `env.example`. Copia a `.env` y ajusta.

## Núcleo

- `NODE_ENV` — entorno (`development`, `production`)
- `DATABASE_URL` — usado por `runtimeConfig` (`nuxt.config.ts`). Valor típico: `sqlite:./pos.db`
- `ENCRYPTION_KEY` — clave para cifrado local si aplica

## APIs externas

- `BCV_API_URL` — URL API tasa oficial (referencia de entorno)
- `DOLAR_TODAY_API_URL` — URL API tasa paralela (referencia de entorno)

## App

- `API_BASE_URL` — base de server API
- `APP_NAME`, `APP_VERSION`

## Monedas e impuestos

- `DEFAULT_CURRENCY` — BS
- `SUPPORTED_CURRENCIES` — `BS,USD,EUR`
- `IVA_RATE`, `ISLR_RATE`

## Sincronización y backup

- `SYNC_INTERVAL`, `AUTO_SYNC`
- `BACKUP_INTERVAL`, `AUTO_BACKUP`

Usa `useRuntimeConfig` en Nuxt para exponer/ocultar valores adecuadamente.

## Nota importante sobre SQLite

- En runtime desktop, el acceso principal usa el plugin SQL de Tauri con DSN `sqlite:pos.db`.
- Para migraciones de Drizzle, la configuración actual usa `drizzle.config.ts` con `./src-tauri/database/pos.db`.
- Mantén claro qué flujo estás ejecutando (runtime app vs migraciones) para evitar confusión de rutas.
