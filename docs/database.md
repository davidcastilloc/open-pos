# 🗄️ Base de Datos y Migraciones

El proyecto usa SQLite con Drizzle ORM.

## Esquemas y conexión

- Esquemas: `app/database/schema/`
- Conexión/utilidades: `app/database/connection.ts`
- Tipos y validaciones: Zod en `app/schemas/`
- Runtime desktop (Tauri SQL): DSN `sqlite:pos.db`
- Migraciones Drizzle (`drizzle.config.ts`): `./src-tauri/database/pos.db`

Consulta `BASE-DE-DATOS-INICIALIZADA.md` para estructura y datos iniciales.

## Tablas relacionadas a Caja

- `cash_sessions` — Sesiones de caja activas/terminadas.
  - Campos: `id`, `tenant_id`, `cashier_id`, `cashier_name`, `start_time`, `end_time?`, `initial_balances(json)`, `status`, `created_at`, `updated_at`.
- `cash_closings` — Cierres de caja consolidados por sesión.
  - Campos: `id`, `tenant_id`, `session_id`, `cashier_id`, `cashier_name`, `start_time`, `end_time`, `shift_duration`, `initial_balances(json)`, `final_balances(json)`, `balance_differences(json)`, `total_transactions`, `sales_by_currency(json)`, `sales_by_payment_method(json)`, `total_sales_amount`, `expenses(json)`, `adjustments(json)`, `observations?`, `status`, `audited_by?`, `audited_at?`, `created_at`, `updated_at`.
- `cash_reports` — Reportes generados (por ahora texto descargable).
  - Campos: `id`, `tenant_id`, `session_id`, `cashier_id`, `cashier_name`, `report_type`, `report_data(json)`, `file_name?`, `file_path?`, `generated_at`, `created_at`.

## Tablas del Sistema de Devoluciones

- `returns` — Devoluciones principales.
  - Campos: `id`, `tenant_id`, `original_sale_id`, `customer_id`, `return_type`, `reason`, `status`, `subtotal`, `tax`, `discount`, `total`, `currency`, `cashier_id`, `authorized_by`, `authorized_at`, `notes`, `created_at`, `updated_at`, `completed_at`.
- `return_items` — Items específicos devueltos.
  - Campos: `id`, `return_id`, `original_sale_item_id`, `product_id`, `quantity`, `original_quantity`, `price`, `total`, `reason`, `created_at`.
- `return_status_history` — Historial de cambios de estado.
  - Campos: `id`, `return_id`, `previous_status`, `new_status`, `changed_by`, `reason`, `notes`, `created_at`.
- `return_transactions` — Transacciones contables de reembolsos.
  - Campos: `id`, `return_id`, `transaction_id`, `account_id`, `amount`, `currency`, `exchange_rate`, `description`, `created_at`.

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

### Contrato de `useDatabase`

- `query<T>(sql, params?): Promise<{ rows: T[] }>`
  - Siempre retorna `{ rows }` con un arreglo tipado; los consumidores deben usar `result.rows`.
- `execute(sql, params?): Promise<{ rows: any[] }>`
  - Si el SQL es `SELECT ...`, retorna `{ rows }` con arreglo; en otro caso `{ rows: [] }`.
- `get<T>(sql, params?): Promise<T | undefined>`
  - Retorna la primera fila o `undefined`.
- `transaction(cb): Promise<any>`
  - Maneja BEGIN/COMMIT/ROLLBACK automáticamente.

Motivación: unificar acceso a datos y evitar ambigüedades entre objetos y arreglos, previniendo errores de ejecución.

## Solución de Problemas de Migraciones

### Error: "Could not locate the bindings file" (better-sqlite3)

Si `pnpm db:migrate` falla con rutas a `better_sqlite3.node` inexistentes:

**Causa:** el binario nativo de `better-sqlite3` no se compiló en la instalación actual.

**Solución:**
1. Recompilar el paquete nativo: `pnpm rebuild better-sqlite3`
2. Reintentar migraciones: `pnpm db:migrate`

**Política del repositorio:**
- `package.json` mantiene `pnpm.onlyBuiltDependencies` con `better-sqlite3` para permitir ese build en entornos limpios sin abrir permisos globales.
- Si se agrega otro paquete nativo, aprobarlo explícitamente con `pnpm approve-builds` y luego ejecutar `pnpm rebuild <paquete>`.

### Error: "table already exists"

Si encuentras errores como `table 'inventory_movements' already exists` al ejecutar migraciones:

**Causa:** Inconsistencias entre el estado de la base de datos y el sistema de migraciones de Drizzle.

**Solución:**
1. Verificar el estado actual: `sqlite3 src-tauri/database/pos.db "SELECT * FROM __drizzle_migrations ORDER BY created_at;"`
2. Sincronizar el journal: Actualizar `src-tauri/database/migrations/meta/_journal.json`
3. Corregir sintaxis SQL en archivos de migración:
   - Usar `CURRENT_TIMESTAMP` en lugar de `datetime('now')`
   - Agregar `IF NOT EXISTS` a declaraciones `CREATE TABLE`
   - Eliminar `ADD COLUMN IF NOT EXISTS` (no soportado en SQLite)

**Archivos afectados típicamente:**
- `src-tauri/database/migrations/0002_add_cash_closing_tables.sql`
- `src-tauri/database/migrations/0002_inventory_movements.sql`
- `src-tauri/database/migrations/meta/_journal.json`

### Verificación Post-Fix

Después de aplicar correcciones:
```bash
# Verificar migraciones
pnpm db:migrate

# Verificar tablas
sqlite3 src-tauri/database/pos.db ".tables"

# Verificar estado de migraciones
sqlite3 src-tauri/database/pos.db "SELECT * FROM __drizzle_migrations ORDER BY created_at;"
```

### Puntos de integración

- `app/database/migrate.ts` asegura creación/upgrade de tablas de caja si es necesario.
- `app/database/connection.ts` crea tablas base e índices y asegura columnas extra en `transactions` (`cashier_id`, `sale_id`, `payment_method`).

### Tabla transactions

Campos relevantes:
- `type`: `sale`, `expense`, `transfer`, `adjustment`
- `payment_method`: método de pago (por ahora `cash`, `card`, `transfer`)
- `cashier_id`: cajero asociado

Migración relacionada:
- `0003_add_payment_method_to_transactions.sql`: agrega `payment_method` e índice `idx_transactions_payment_method`.
