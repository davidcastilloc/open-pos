# POS System

Un sistema POS abierto para terminales de punto de venta y otros dispositivos.
Construido con [Nuxt 4](https://nuxt.com) y [Tauri 2](https://v2.tauri.app).

---

![GitHub version](https://img.shields.io/github/package-json/v/davidcastilloc/open-pos)
![GitHub license](https://img.shields.io/github/license/davidcastilloc/open-pos)

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
- [Drizzle ORM + SQLite](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- ESLint con [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- Auto imports (también para APIs de Tauri)

---

## 🔧 Funcionalidades principales

### 🏪 **Sistema POS Completo**
- **Interfaz de venta** con catálogo de productos
- **Carrito de compras** con descuentos y cálculos automáticos
- **Procesamiento de pagos** multi-moneda (BS, USD, EUR)
- **Gestión de impuestos** (IVA 16%, ISLR 2%)
- **Selección de clientes** en ventas
- **Creación rápida** de clientes desde POS
- **Sistema de devoluciones** parciales y totales con trazabilidad completa
- **Sistema de notificaciones** en tiempo real
- **Gestión de usuarios/cajeros** con roles

### 📦 **Gestión de Productos**
- **CRUD completo** de productos con interfaz moderna
- **Filtros avanzados** (búsqueda, categoría, estado, stock)
- **Generador automático de SKU**
- **Gestión de imágenes** con vista previa
- **Validaciones robustas** con esquemas Zod
- **Activar/desactivar** productos
- **Estadísticas en tiempo real**

### 💰 **Sistema Multi-Moneda**
- **Conversión automática** entre BS, USD, EUR
- **Tasas de cambio** con APIs externas (BCV y DolarToday)
- **Actualización automática** de tasas de cambio
- **Formateo local** según estándares venezolanos
- **Histórico de tasas** de cambio con persistencia
- **Fallback automático** a tasas por defecto

### 🔄 **Sistema de Devoluciones**
- **Devoluciones parciales y totales** con selección granular de productos
- **Trazabilidad completa** con historial de estados y auditoría
- **Integración con POS** para búsqueda rápida de ventas
- **Gestión de stock automática** al procesar devoluciones
- **Transacciones contables** para reembolsos
- **Aprobación por supervisores** con control de permisos
- **Dashboard de gestión** con estadísticas en tiempo real

### 👤 **Sistema de Usuarios y Notificaciones**
- **Gestión de usuarios/cajeros** con roles (admin, cashier, manager)
- **Sistema de notificaciones** en tiempo real con Nuxt UI
- **Feedback visual** para todas las operaciones
- **Persistencia de sesiones** de usuario
- **Información dinámica** del cajero actual

### 🖥️ **Aplicación Desktop**
- **Ejecución nativa** con Tauri 2
- **Notificaciones del sistema**
- **Acceso a información del SO**
- **Almacenamiento local** con SQLite
- **Multiplataforma** (Windows, macOS, Linux)

---

## 📱 **Páginas Disponibles**

### 🏠 **Dashboard Principal** (`/`)
- Estado del sistema y base de datos
- Tasas de cambio con actualización manual
- Acciones rápidas y navegación

### 🏪 **Punto de Venta** (`/pos`)
- Catálogo de productos con filtros
- Carrito de compras interactivo
- Procesamiento de pagos multi-moneda
- Cálculo automático de impuestos
- Selección de clientes en ventas
- Creación rápida de clientes
- **Sistema de devoluciones** integrado con búsqueda de ventas
- **Sistema de notificaciones** para feedback del usuario
- **Gestión de sesiones de caja** con apertura/cierre

### 📦 **Gestión de Productos** (`/products`)
- **CRUD completo** de productos
- Filtros avanzados y búsqueda
- Generador automático de SKU
- Gestión de imágenes y categorías
- Activar/desactivar productos

### 👥 **Gestión de Clientes** (`/customers`)
- **CRUD completo** de clientes
- Búsqueda avanzada por múltiples criterios
- Filtros por estado (activos/inactivos)
- Formularios con validación en tiempo real
- Vista detallada de información del cliente
- Estadísticas en tiempo real

### 🔄 **Gestión de Devoluciones** (`/returns`)
- **Dashboard completo** con estadísticas en tiempo real
- **Filtros avanzados** por estado, fecha, cliente
- **Gestión de estados** (pendiente, aprobada, completada, rechazada)
- **Acciones rápidas** para aprobar, rechazar y completar devoluciones
- **Vista detallada** con historial completo de cambios
- **Búsqueda de ventas** para crear nuevas devoluciones

### 🧪 **Página de Pruebas** (`/test`)
- Estado de la base de datos
- Configuración del sistema
- Pruebas de conversión de monedas
- Validación de funcionalidades

---

## 📦 Requisitos previos

- Node.js `>=23`
- [Rust configurado](https://v2.tauri.app/start/prerequisites) (necesario para Tauri)
- [pnpm](https://pnpm.io) (enforced por el proyecto)

---

## ⚡ Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/davidcastilloc/open-pos
cd open-pos

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

## 🎨 Guías de UI

- Uso de Nuxt UI v3 con modales: `v-model:open` + `<template #content>` + `UCard`.
- Sin colores explícitos en clases Tailwind: usar solo clases estructurales; colores semánticos únicamente en componentes de Nuxt UI (`color="primary|secondary|success|warning|error|info|neutral"`).
- Detalles completos en `docs/ui-guidelines.md`.

---

## 🧭 Documentación

- Documentación ampliada en `docs/README.md`:
  - Estructura del proyecto y convenciones
  - Base de datos y migraciones
  - Integración Tauri y plugins
  - Gestión de productos e inventario
  - Guías de UI y reglas de colores (`docs/ui-guidelines.md`)
  - Testing y calidad
  - Versionado y releases
  - Variables de entorno y scripts

Documentos relacionados en la raíz:
- `ESTADO-ACTUAL-PROYECTO.md`, `ROADMAP-TAREAS-DESARROLLO.md`
- `RESUMEN-EJECUTIVO-v1.9.0.md`
- `INTERFAZ-POS-COMPLETADA.md`, `GESTION-PRODUCTOS-COMPLETADA.md`
- `CRUD-PRODUCTOS-COMPLETADO.md` - Documentación detallada del CRUD de productos
- `SISTEMA-DEVOLUCIONES-IMPLEMENTADO.md` - Documentación completa del sistema de devoluciones
- `BASE-DE-DATOS-INICIALIZADA.md`, `SEMANTIC-RELEASE-FIX.md`

---

## 🧾 Cierre de Caja (Resumen)

- **Apertura de caja** desde el layout del POS con el botón "Abrir Caja"
- **Gestión de sesiones** con persistencia en base de datos
- **Página `cash-closing`**: generar reporte y terminar turno
- **Sistema de usuarios** con información del cajero actual
- **Notificaciones** para confirmación de operaciones
- Documentación completa en `docs/cash-closing.md`

---

## 🤝 Contribución

Lee `CONTRIBUTING.md` y usa Conventional Commits para PRs.
