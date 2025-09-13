# 🗄️ Base de Datos y Migraciones

El proyecto usa SQLite con Drizzle ORM.

## Esquemas y conexión

- Esquemas: `app/database/schema/`
- Conexión/utilidades: `app/database/connection.ts`
- Tipos y validaciones: Zod en `app/schemas/`

Consulta `BASE-DE-DATOS-INICIALIZADA.md` para estructura y datos iniciales.

## Tablas relacionadas a Caja

- `cash_sessions` — Sesiones de caja activas/terminadas.
  - Campos: `id`, `tenant_id`, `cashier_id`, `cashier_name`, `start_time`, `end_time?`, `initial_balances(json)`, `status`, `created_at`, `updated_at`.
- `cash_closings` — Cierres de caja consolidados por sesión.
  - Campos: `id`, `tenant_id`, `session_id`, `cashier_id`, `cashier_name`, `start_time`, `end_time`, `shift_duration`, `initial_balances(json)`, `final_balances(json)`, `balance_differences(json)`, `total_transactions`, `sales_by_currency(json)`, `sales_by_payment_method(json)`, `total_sales_amount`, `expenses(json)`, `adjustments(json)`, `observations?`, `status`, `audited_by?`, `audited_at?`, `created_at`, `updated_at`.
- `cash_reports` — Reportes generados (por ahora texto descargable).
  - Campos: `id`, `tenant_id`, `session_id`, `cashier_id`, `cashier_name`, `report_type`, `report_data(json)`, `file_name?`, `file_path?`, `generated_at`, `created_at`.

Notas:
- Campos JSON se almacenan como TEXT (JSON serializado) para simplicidad y portabilidad.
- Las fechas se almacenan como ISO strings.

## Migraciones

- Ruta: `src-tauri/database/migrations/`
- Generar migraciones:

```bash
pnpm db:generate
```

- Aplicar migraciones:

```bash
pnpm db:migrate
```

- Studio (visual):

```bash
pnpm db:studio
```

## Notas

- Mantén sincronizado Drizzle (esquemas) con migraciones.
- Evita cambios manuales en SQL generados salvo necesidades avanzadas.

### Puntos de integración

- `app/database/migrate.ts` asegura creación/upgrade de tablas de caja si es necesario.
- `app/database/connection.ts` crea tablas base e índices y asegura columnas extra en `transactions` (`cashier_id`, `sale_id`).
 - `app/database/connection.ts` crea tablas base e índices y asegura columnas extra en `transactions` (`cashier_id`, `sale_id`, `payment_method`).

### Tabla transactions

Campos relevantes:
- `type`: `sale`, `expense`, `transfer`, `adjustment`
- `payment_method`: método de pago (por ahora `cash`, `card`, `transfer`)
- `cashier_id`: cajero asociado

Migración relacionada:
- `0003_add_payment_method_to_transactions.sql`: agrega `payment_method` e índice `idx_transactions_payment_method`.



