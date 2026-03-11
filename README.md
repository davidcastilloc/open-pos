# POS System

Sistema POS abierto para terminales de punto de venta y otros dispositivos.
Construido con [Nuxt 4](https://nuxt.com) + [Tauri 2](https://v2.tauri.app).

![GitHub version](https://img.shields.io/github/package-json/v/davidcastilloc/open-pos)
![GitHub license](https://img.shields.io/github/license/davidcastilloc/open-pos)

![screenshot](./public/screenshot.png)

## Requisitos

- Node.js `>=23`
- `pnpm` (el repo fuerza `pnpm` con `only-allow`)
- Rust + prerequisitos de Tauri por SO: https://v2.tauri.app/start/prerequisites

## Instalación rápida

```bash
git clone https://github.com/davidcastilloc/open-pos
cd open-pos
pnpm install
cp env.example .env
pnpm db:migrate
pnpm dev
```

Para flujo desktop:

```bash
pnpm tauri:dev
```

## Comandos útiles

```bash
# Desarrollo
pnpm dev
pnpm tauri:dev

# Calidad
pnpm lint
pnpm type-check
pnpm test

# Base de datos
pnpm db:generate
pnpm db:migrate
pnpm db:studio

# Build
pnpm generate
pnpm tauri:build

# Linux (desktop)
pnpm tauri:check:linux
```

## Documentación canónica (fuente de verdad)

El índice oficial está en [`docs/CANONICAL-DOCS.md`](docs/CANONICAL-DOCS.md).
Si un documento histórico contradice un documento canónico, prevalece `docs/`.

- Navegación general: [`docs/README.md`](docs/README.md)
- Estructura y convenciones: [`docs/project-structure.md`](docs/project-structure.md)
- Base de datos y migraciones: [`docs/database.md`](docs/database.md)
- UI y reglas de diseño: [`docs/ui-guidelines.md`](docs/ui-guidelines.md)
- Tauri: [`docs/tauri.md`](docs/tauri.md)
- Testing: [`docs/testing.md`](docs/testing.md)
- Variables de entorno: [`docs/env.md`](docs/env.md)
- Scripts: [`docs/scripts.md`](docs/scripts.md)
- Estado de brechas: [`docs/ANALISIS-UNIFICADO-PRD.md`](docs/ANALISIS-UNIFICADO-PRD.md)
- Backlog ejecutable: [`docs/ISSUES-MILESTONES.md`](docs/ISSUES-MILESTONES.md)
- Históricos (no canónicos): [`docs/old/`](docs/old/)

## Gobernanza documental

- Todo PR funcional debe actualizar al menos un documento canónico relevante.
- Si no aplica documentación, se debe indicar explícitamente en el PR.
- Evitar usar documentos legacy como estado operativo actual.

## Contribución

Leer `CONTRIBUTING.md` y usar Conventional Commits.
