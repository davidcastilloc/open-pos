# 🧾 Cierre de Caja

Este documento describe el flujo de apertura/cierre de caja, estructuras de datos y APIs internas.

## Componentes y Páginas

- `app/layouts/pos.vue`: encabezado con estado de caja y acciones de abrir/cerrar.
- `app/components/OpenCashSessionModal.vue`: modal para abrir sesión de caja con balances iniciales.
- `app/pages/cash-closing.vue`: interfaz para generar reporte y terminar turno.

## Composables Clave

- `useCashClosing()`: orquesta el ciclo de vida del turno y reporte.
  - Estado: `isCashSessionOpen`, `currentSession`, `shiftStartTime`.
  - Acciones: `openCashSession(initialBalances?)`, `initializeCashSession()`, `processCashClosing(observations?)`, `generateReport()`.
- `useCashClosingDB()`: persistencia SQL (SQLite vía Tauri Plugin).
  - Sesiones: `createCashSession`, `getActiveCashSession`, `closeCashSession`.
  - Cierres: `createCashClosing`.
  - Reportes: `createCashReport`, `getReportsBySession`, `getReportsByCashier`.

## Flujo de Trabajo

1) Apertura de caja

```
OpenCashSessionModal → openCashSession(initialBalances)
  ↳ Crea registro en cash_sessions (status=open)
  ↳ Actualiza estado global (isCashSessionOpen=true)
```

2) Jornada de ventas

```
Saldos visibles en layout POS (accounts agregados por moneda)
Transacciones asociarán `cashier_id`/`sale_id` y `payment_method` en `transactions`
```

3) Generar Reporte (opcional)

```
cash-closing.vue → generateReport()
  ↳ Compila resumen (ventas por moneda y métodos) y saldos actuales
  ↳ Guarda en cash_reports (report_type=closing_report)
  ↳ Descarga archivo .txt al cliente
```

4) Terminar turno (Cierre)

```
cash-closing.vue → processCashClosing(observations)
  ↳ Valida sesión activa y startTime
  ↳ Calcula duración, diferencias de saldo, totales
  ↳ Inserta cash_closings (status=closed)
  ↳ closeCashSession() (marca la sesión como closed)
```

## Modelos (tipos)

- CashSession (DB): id, tenant_id, cashier_id, cashier_name, start_time, end_time?, initial_balances(json), status, created_at, updated_at.
- CashClosing (DB): id, tenant_id, session_id, cashier_id, cashier_name, start_time, end_time, shift_duration, initial_balances(json), final_balances(json), balance_differences(json), total_transactions, sales_by_currency(json), sales_by_payment_method(json), total_sales_amount, expenses(json), adjustments(json), observations?, status, audited_by?, audited_at?, created_at, updated_at.
- CashReport (DB): id, tenant_id, session_id, cashier_id, cashier_name, report_type, report_data(json), file_name?, file_path?, generated_at, created_at.

Ventas/Transacciones relevantes:
- Transactions (DB): id, tenant_id, account_id, type, amount, currency, exchange_rate?, reference?, description?, cashier_id?, sale_id?, payment_method?, created_at.

Notas:
- Campos JSON se guardan como TEXT serializado.
- Fechas en ISO string.

## Migraciones y Creación de Tablas

- SQL declarativa en `src-tauri/database/migrations/0002_add_cash_closing_tables.sql` y `0003_add_payment_method_to_transactions.sql`.
- Salvaguardas de creación/migración en `app/database/migrate.ts` y `app/database/connection.ts`.

Comandos útiles (Drizzle):

```
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Consideraciones de UI/UX

- Respetar reglas de color del sistema (sin colores explícitos Tailwind en HTML).
- Botones usan colores semánticos de Nuxt UI (`success`, `error`, etc.).
- Estados y tiempos localizados a `es-VE`.

## Próximos pasos

- Asociar transacciones diarias reales a la sesión: `cashier_id` y `sale_id`.
- Resumen de ventas por fecha/sesión desde tablas `sales`/`transactions`.
- Auditoría de cierres (`audited_by`, `audited_at`).


