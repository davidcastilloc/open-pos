![logo](./public/logo.png){ width=150 }

# POS System

Un sistema POS abierto para terminales de punto de venta y otros dispositivos.
Construido con [Nuxt 4](https://nuxt.com) y [Tauri 2](https://v2.tauri.app).

---

![GitHub version](https://img.shields.io/github/package-json/v/davidjose/pos-system)
![GitHub license](https://img.shields.io/github/license/davidjose/pos-system)

---

![screenshot](./public/screenshot.png)

**Powered by Nuxt 4 + Tauri 2**

---

## 🚀 Tecnologías principales

- [Nuxt 4](https://nuxt.com)
- [Vue 3](https://vuejs.org) + [Vue Router](https://router.vuejs.org)
- [Tauri 2](https://v2.tauri.app)
- [Nuxt UI 3](https://ui.nuxt.com)
- [Zod](https://zod.dev)
- [TypeScript](https://www.typescriptlang.org)
- ESLint con [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- Auto imports (también para APIs de Tauri)

---

## 🔧 Funcionalidades principales

- Ejecución de comandos de shell desde la aplicación
- Notificaciones nativas del sistema
- Acceso a información del sistema operativo
- Almacenamiento y recuperación de datos locales
- Integración con tray icon
- Total soporte de características de Nuxt (rutas, layouts, middleware, módulos, etc.)

---

## 📦 Requisitos previos

- Node.js `>=23`
- [Rust configurado](https://v2.tauri.app/start/prerequisites) (necesario para Tauri)
- [pnpm](https://pnpm.io) (enforced por el proyecto)

---

## ⚡ Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/davidjose/pos-system
cd pos-system

# Instalar dependencias
pnpm install

# Variables de entorno (opcional)
cp env.example .env

# Desarrollo (web o desktop)
pnpm dev          # servidor Nuxt
pnpm tauri:dev    # app desktop con Tauri
```

### 🧰 Comandos útiles

```bash
# Calidad
pnpm lint
pnpm type-check
pnpm test

# Base de datos (Drizzle)
pnpm db:generate
pnpm db:migrate
pnpm db:studio

# Build
pnpm build
pnpm tauri:build
```

---

## 🧭 Documentación

- Documentación ampliada en `docs/README.md`:
  - Estructura del proyecto y convenciones
  - Base de datos y migraciones
  - Integración Tauri y plugins
  - Gestión de productos e inventario
  - Testing y calidad
  - Versionado y releases
  - Variables de entorno y scripts

Documentos relacionados en la raíz:
- `ESTADO-ACTUAL-PROYECTO.md`, `ROADMAP-TAREAS-DESARROLLO.md`
- `INTERFAZ-POS-COMPLETADA.md`, `GESTION-PRODUCTOS-COMPLETADA.md`
- `BASE-DE-DATOS-INICIALIZADA.md`, `SEMANTIC-RELEASE-FIX.md`

---

## 🤝 Contribución

Lee `CONTRIBUTING.md` y usa Conventional Commits para PRs.
