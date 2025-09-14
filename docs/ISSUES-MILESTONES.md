# 🗂️ Backlog por Milestones (Issues Ejecutables)

Este documento define un backlog accionable basado en el PRD y el estado actual. Cada issue incluye objetivo, criterios de aceptación y referencias técnicas. Al implementar UI, respetar `docs/ui-guidelines.md` (colores semánticos y sintaxis de modales Nuxt UI v3).

---

## Milestone 1: MVP Extendido (2–3 semanas)

### 1.1 Tickets/Impresión básica del POS
- Objetivo: Generar ticket (A4 y térmico) con desglose (subtotal, IVA 16%, ISLR 2%), imprimir vía Tauri e imprimir/guardar PDF.
- Criterios de aceptación:
  - Desde `app/pages/pos.vue`, botón "Imprimir ticket" post‑venta.
  - Previsualización (`UCard`) y descarga PDF; impresión directa si hay impresora térmica.
  - Template respetando `docs/ui-guidelines.md` (sin colores Tailwind explícitos).
  - Funciona offline.
- Entregables:
  - `app/components/TicketPreview.vue`
  - `app/composables/usePrint.ts` (Tauri print/HTML→PDF)
  - Actualización `app/pages/pos.vue` (acciones post‑venta)
- Referencias: `INTERFAZ-POS-COMPLETADA.md`, `PRD-POS-Sistema-Completo.md` (Tickets/Facturas), `src-tauri/`.

### 1.2 Exportación CSV/Excel (ventas e inventario)
- Objetivo: Exportar ventas del día y catálogo de productos.
- Criterios de aceptación:
  - En `app/pages/cash-closing.vue`: botón "Exportar ventas (CSV)".
  - En `app/pages/products.vue`: botón "Exportar catálogo (CSV)".
  - Encabezados y separadores válidos; UTF‑8 con BOM.
- Entregables: utilidades `useExport.ts` y botones en las vistas mencionadas.
- Referencias: `docs/cash-closing.md`, `docs/products-inventory.md`.

### 1.3 Auditoría de cierres de caja (estado audited)
- Objetivo: Flujo de auditoría para cierres: marcar/auditar con usuario y timestamp.
- Criterios de aceptación:
  - Persistir `audited_by`, `audited_at` y `status='audited'` en `cash_closings`.
  - UI con acción "Marcar como auditado" y filtro por estado.
  - Registro de notificación de éxito/error.
- Entregables: actualización de `useCashClosing`, `app/pages/cash-closing.vue` y consultas.
- Referencias: `docs/cash-closing.md`, `docs/database.md`.

---

## Milestone 2: SaaS Core (6–8 semanas)

### 2.1 Autenticación + Multi‑tenant (base)
- Objetivo: Autenticación con sesiones persistentes y aislamiento por tenant (local→preparado nube).
- Aceptación: registro/login/logout mínimo, tabla tenants, FK `tenant_id` en entidades principales, guardas de ruta.
- Referencias: PRD (SaaS), `docs/users-notifications.md`.

### 2.2 Cola de sincronización local + API Edge mínima
- Objetivo: Persistir operaciones en `sync_queue` y sincronizar con Worker en Cloudflare.
- Aceptación: encolado, reintentos, endpoint `/sync` (edge), confirmación y marcado "synced".
- Referencias: PRD (Sincronización), `docs/project-structure.md`.

### 2.3 Dashboard KPIs básicos
- Objetivo: KPIs (ventas del día, ticket promedio, top productos) en `/`.
- Aceptación: tarjetas con KPIs; consultas eficientes; actualización manual.
- Referencias: PRD (Analítica), `ESTADO-ACTUAL-PROYECTO.md`.

### 2.4 API pública mínima
- Objetivo: Endpoints locales/edge para listar productos y ventas (read‑only) con token simple.
- Aceptación: auth por header, rate‑limit básico, tipos TS compartidos.
- Referencias: PRD (API pública).

---

## Milestone 3: Expansión (4–6 semanas)

### 3.1 Multi‑sucursal básico
- Objetivo: Entidad `branches`, asignación de ventas/inventario por sucursal y vistas filtradas.
- Aceptación: CRUD de sucursales, selector de sucursal activa, totales por sucursal.
- Referencias: PRD (Multi‑sucursal).

### 3.2 Suscripciones con Stripe
- Objetivo: Planes Free/Starter/Pro/Enterprise con validación en edge.
- Aceptación: creación/cancelación, webhooks mínimos, gating de features.
- Referencias: PRD (Monetización).

### 3.3 Reportes fiscales básicos (SENIAT)
- Objetivo: Libro de ventas e IVA exportables.
- Aceptación: formatos válidos, filtros por período, exportación CSV/PDF.
- Referencias: PRD (Compliance), `docs/cash-closing.md`.

---

## Milestone 4: Premium/Enterprise (8–12 semanas)

### 4.1 Integraciones (e‑commerce/contabilidad)
- Objetivo: Conectores iniciales (Shopify, QuickBooks) de solo exportación.
- Aceptación: jobs manuales, logs y reintentos.
- Referencias: PRD (Integraciones).

### 4.2 Seguridad avanzada
- Objetivo: 2FA, roles granulares, registro de auditoría completo.
- Aceptación: 2FA por TOTP; auditoría consultable por fecha/usuario.
- Referencias: PRD (Seguridad/Auditoría).

### 4.3 IA/ML (recomendaciones)
- Objetivo: Recomendaciones de productos complementarios simples (reglas/soporte ML posterior).
- Aceptación: módulo sugerencias en POS con métricas de conversión.
- Referencias: PRD (IA/Plus).

---

## Notas generales
- UI: seguir `docs/ui-guidelines.md` (sin colores explícitos Tailwind; modales Nuxt UI v3 con `v-model:open` y `#content` + `UCard`).
- Datos: respetar contrato `{ rows }` de `useDatabase.query` y normalización de arreglos en consumo.
- Testing: agregar casos mínimos por feature (Vitest) y verificación de tipos.
