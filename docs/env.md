# 🔧 Variables de Entorno y Configuración

Ejemplo en `env.example`. Copia a `.env` y ajusta.

## Núcleo

- `NODE_ENV` — entorno (`development`, `production`)
- `DATABASE_URL` — `sqlite:./database/pos.db`
- `ENCRYPTION_KEY` — clave para cifrado local si aplica

## APIs externas

- `BCV_API_URL` — API tasa oficial
- `DOLAR_TODAY_API_URL` — API tasa paralela

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


