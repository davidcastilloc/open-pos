# OpenPOS - Sistema de Punto de Venta

## What This Is

Sistema POS (Punto de Venta) multiplataforma para gestión de ventas, inventario y clientes. Construido con Nuxt 4 + Tauri 2. Aplicación de escritorio para Venezuela con soporte multilenguaje.

## Core Value

Sistema de punto de venta accesible y funcional para pequeños negocios en Venezuela, con gestión completa de productos, ventas, clientes e inventario.

## Current Milestone: v1.1 Configuración Inicial del Sistema

**Goal:** Implementar las pantallas de configuración inicial del sistema accesibles para el usuario.

**Target features:**
- Datos del negocio (nombre, dirección, RIF, teléfono, logo)
- Gestión de usuarios (crear, editar, eliminar, roles, permisos)
- Gestión de categorías de productos

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] CONFIG-01: Datos del negocio configurables desde UI
- [ ] CONFIG-02: Gestión de usuarios (CRUD)
- [ ] CONFIG-03: Roles y permisos de usuarios
- [ ] CONFIG-04: Gestión de categorías de productos

### Out of Scope

- [Facturación electrónica] — Requiere integración con servicios externos
- [Reportes avanzados] — Posteriores al milestone de configuración
- [Sincronización cloud] — Funcionalidad futura

## Context

- **Stack actual:** Nuxt 4 + Tauri 2 + SQLite + Drizzle
- **UI:** Nuxt UI con diseño personalizado
- **Existing code:** Mapeado en `.planning/codebase/`

## Constraints

- **Plataforma:** Desktop (Tauri) - enfoque principal
- **Base de datos:** SQLite local
- **Idioma:** Español (Venezuela)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite local | Sin servidor externo, portable | ✓ Good |
| Tauri v2 | Multiplataforma (Linux, Mac, Windows) | ✓ Good |
| Nuxt 4 | Full-stack con SSR/SSG | ✓ Good |

---
*Last updated: 2025-03-11 after milestone v1.1 initialization*
