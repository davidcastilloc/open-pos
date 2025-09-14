# 🗂️ Backlog por Milestones (issues ejecutables)

Este backlog convierte la comparativa del documento `ANALISIS-UNIFICADO-PRD.md` en issues accionables agrupados por milestone. Cada issue incluye criterios de aceptación, áreas impactadas y estimación.

## 🔖 Convenciones

- Formato de título: `[Área] Acción concisa`
- Etiquetas sugeridas: `type:feature`, `type:chore`, `prio:alta|media|baja`, `size:S|M|L`
- Estimaciones: S (<=1 día), M (2-3 días), L (4-7 días)
- Referencias: enlazar a archivos y docs relevantes

---

## ✅ Milestone M1 — MVP Extendido (4–6 semanas)

1) [POS] Implementar tickets/impresión básica
- Criterios de aceptación
  - Imprimir ticket térmico local (Tauri) al completar venta
  - Exportar PDF simple desde `/pos` y adjuntar a descarga
  - Plantilla con encabezado, items, impuestos (IVA/ISLR), totales y método de pago
  - Opción de reimpresión desde historial de ventas (mínimo hook preparado)
- Áreas impactadas: `app/pages/pos.vue`, `src-tauri/`, `app/components/`
- Referencias: PRD (Tickets/Facturas), `INTERFAZ-POS-COMPLETADA.md`
- Estimación: L — prio: alta — etiquetas: `type:feature`, `prio:alta`, `size:L`

2) [Reportes] Exportación CSV/Excel
- Criterios de aceptación
  - Exportar ventas del día desde `/cash-closing` a CSV
  - Exportar productos e inventario desde `/products` a CSV
  - Columnas alineadas con DB y formato `es-VE`
- Áreas impactadas: `app/pages/cash-closing.vue`, `app/pages/products.vue`, utilidades
- Referencias: PRD (Exportación), `docs/cash-closing.md`, `docs/products-inventory.md`
- Estimación: M — prio: alta — etiquetas: `type:feature`, `prio:alta`, `size:M`

3) [Caja] Auditoría de cierres (estado audited end‑to‑end)
- Criterios de aceptación
  - Marcar cierre como `audited` con usuario y timestamp
  - Historial visible y filtro por estado en `/cash-closing`
  - Validaciones: solo roles con permiso pueden auditar
- Áreas impactadas: `app/composables/useCashClosing.ts`, `app/pages/cash-closing.vue`, DB (`cash_closings`)
- Referencias: PRD (Auditoría), `docs/cash-closing.md`, `docs/database.md`
- Estimación: M — prio: media — etiquetas: `type:feature`, `prio:media`, `size:M`

---

## 🚀 Milestone M2 — SaaS Core (8–12 semanas)

4) [Auth] Autenticación y multi‑tenant básico
- Criterios de aceptación
  - Login/logout local + estructura para tenants
  - Roles/Permisos básicos aplicados en UI crítica (caja, devoluciones)
- Áreas impactadas: `app/composables/useUser.ts`, middlewares, DB (`users`, `system_config`)
- Referencias: PRD (SaaS), `docs/users-notifications.md`
- Estimación: L — prio: alta — etiquetas: `type:feature`, `prio:alta`, `size:L`

5) [Sync] Cola local y API edge básica (Cloudflare)
- Criterios de aceptación
  - Tabla `sync_queue` y productor/consumidor local offline‑first
  - Worker cloud con endpoint `/sync` que acepta lotes y responde confirmación
  - Reintentos con backoff y métricas mínimas
- Áreas impactadas: `app/database/`, `server/api/*` o Worker, `app/composables`
- Referencias: PRD (Sincronización), `docs/project-structure.md`
- Estimación: L — prio: alta — etiquetas: `type:feature`, `prio:alta`, `size:L`

6) [KPIs] Dashboard analítico básico
- Criterios de aceptación
  - Vista con ventas del día, ticket promedio, top productos
  - Consultas agregadas eficientes y cache local
- Áreas impactadas: `app/pages/`, `app/composables/`, consultas DB
- Referencias: PRD (Analítica), `ESTADO-ACTUAL-PROYECTO.md`
- Estimación: M — prio: media — etiquetas: `type:feature`, `prio:media`, `size:M`

7) [API] API pública mínima (REST)
- Criterios de aceptación
  - Endpoints read‑only para productos y ventas agregadas
  - Token simple (bearer) y rate limit básico
- Áreas impactadas: `server/api/*`, configuración
- Referencias: PRD (API pública)
- Estimación: M — prio: media — etiquetas: `type:feature`, `prio:media`, `size:M`

---

## 🏢 Milestone M3 — Expansión Operativa (6–10 semanas)

8) [Sucursales] Multi‑sucursal básico
- Criterios de aceptación
  - Estructura de sucursales en DB y asignación de ventas/productos
  - Filtros por sucursal y consolidado simple
- Áreas impactadas: DB, `app/pages/`, `app/composables/`
- Referencias: PRD (Multi‑sucursal)
- Estimación: L — prio: media — etiquetas: `type:feature`, `prio:media`, `size:L`

9) [Stripe] Suscripciones SaaS
- Criterios de aceptación
  - Planes Free/Starter/Pro con webhook de validación
  - Bloqueos/UI de límites por plan
- Áreas impactadas: backend/worker, `app/plugins/`, UI estados
- Referencias: PRD (Monetización)
- Estimación: L — prio: media — etiquetas: `type:feature`, `prio:media`, `size:L`

10) [Fiscal] Reportes SENIAT/IVA básicos
- Criterios de aceptación
  - Libro de ventas y reporte de IVA exportables (CSV)
  - Validaciones de formato y fechas `es-VE`
- Áreas impactadas: consultas SQL, páginas de reportes
- Referencias: PRD (Compliance), `docs/database.md`
- Estimación: M — prio: media — etiquetas: `type:feature`, `prio:media`, `size:M`

---

## 💎 Milestone M4 — Premium/Enterprise (variable)

11) [Integraciones] E‑commerce/contabilidad
- Criterios de aceptación
  - Conectores base (Shopify/WooCommerce o QuickBooks)
  - Sincronización unidireccional mínima
- Estimación: L — prio: baja — etiquetas: `type:feature`, `prio:baja`, `size:L`

12) [Seguridad] 2FA y auditoría avanzada
- Criterios de aceptación
  - 2FA opcional, logs detallados de acciones
- Estimación: L — prio: baja — etiquetas: `type:feature`, `prio:baja`, `size:L`

13) [IA] Recomendaciones de productos
- Criterios de aceptación
  - Motor inicial basado en ventas históricas (reglas o ML simple)
- Estimación: L — prio: baja — etiquetas: `type:feature`, `prio:baja`, `size:L`

---

## 🔗 Referencias cruzadas

- Comparativa y brechas: `docs/ANALISIS-UNIFICADO-PRD.md`
- Estado actual y logros: `ESTADO-ACTUAL-PROYECTO.md`
- DB y modelos: `docs/database.md`
- POS/Productos/Caja/Devoluciones: `docs/*.md` correspondientes


