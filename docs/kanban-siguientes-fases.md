# 🗂️ Kanban – Siguientes Fases de Desarrollo (Actualizado: 13 Sep 2025)

> Fuente: PRD-POS-Sistema-Completo.md, ESTADO-ACTUAL-PROYECTO.md, CHANGELOG.md, commits v1.6.0–v1.11.0
>
> Nota UI: seguir reglas de colores/modales (sin colores explícitos, `v-model:open` + `#content` + `UCard`).

## 📥 Backlog (SaaS/Premium)

- [ ] Autenticación y roles (RBAC básico)
  - Áreas: `app/plugins/`, `app/composables/`, `app/pages/`
  - Criterios:
    - Login/Logout local (stub)
    - Roles: admin, cajero (solo UI gating)
- [ ] Sincronización básica (cola local + Worker stub)
  - Áreas: `app/composables/useTransactions.ts`, `app/database/`, `server/api/`
  - Criterios:
    - `sync_queue` persiste operaciones
    - Endpoint de eco (Cloudflare Worker/local)
- [ ] Dashboard KPIs básicos
  - Áreas: `app/pages/index.vue`
  - Criterios:
    - Ventas del día, ticket promedio, más vendidos
- [ ] API pública mínima (lectura)
  - Áreas: `server/api/`
  - Criterios:
    - Listar productos, ventas (paginado)
- [ ] Multi-sucursal básico
  - Áreas: `app/database/schema/`, `app/composables/`
  - Criterios:
    - Campo `branchId` y filtros por sucursal

## ✅ Ready (Listas para iniciar)

- [ ] Devoluciones (parciales/totales con trazabilidad)
  - Áreas: `app/composables/useTransactions.ts`, `app/pages/pos.vue`, `app/database/schema/`
  - Criterios:
    - Nueva tabla/relación de `refunds` o estado en `sales`
    - UI en POS para seleccionar ítems y cantidades
    - Stock e informes actualizados
- [ ] Tickets/Facturas (impresión básica + exportación)
  - Áreas: `app/pages/pos.vue`, `app/components/`, `src-tauri/`
  - Criterios:
    - Plantilla ticket A6/80mm (print window)
    - Exportación PDF/HTML (mínimo)
- [ ] Exportación CSV (reportes clave)
  - Áreas: `app/pages/cash-closing.vue`, `app/pages/products.vue`
  - Criterios:
    - CSV de ventas del día y productos
    - Separador configurable y encabezados
- [ ] Tasas de cambio automáticas (BCV/DolarToday)
  - Áreas: `app/composables/useCurrency.ts`, `app/plugins/currency.client.ts`, `app/database/`
  - Criterios:
    - Job/manual fetch + persistencia histórico
    - Fallback manual y bandera de validez
- [ ] Auditoría de cierre (aprobación)
  - Áreas: `app/pages/cash-closing.vue`, `app/composables/useCashClosing.ts`
  - Criterios:
    - Estado `audited` y usuario aprobador
    - Registro de fecha y notas de auditoría

## 🔄 In Progress

- [ ] —

## 🏁 Done

- [x] Reglas de UI formalizadas (colores/modales)
- [x] POS + Productos + Clientes + Cierre de caja + Métodos de pago
- [x] Migraciones estables y contrato `{ rows }` en `useDatabase`

---

## 📎 Referencias

- `PRD-POS-Sistema-Completo.md`
- `ESTADO-ACTUAL-PROYECTO.md`
- `ROADMAP-TAREAS-DESARROLLO.md`
- `docs/ui-guidelines.md`
