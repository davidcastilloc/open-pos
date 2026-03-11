# 🔧 Fix de Migraciones - Completado

**Fecha:** 2025-01-15
**Problema:** Error en migraciones de base de datos - "table already exists"
**Estado:** ✅ RESUELTO

## Problema Original

Al ejecutar `pnpm db:migrate` se producía el siguiente error:

```
DrizzleError: Failed to run the query '
CREATE TABLE `inventory_movements` (
    ...
);
'
cause: SqliteError: table `inventory_movements` already exists
```

## Causa Raíz

1. **Inconsistencias en el sistema de migraciones:** Las tablas existían en la base de datos pero no estaban correctamente registradas en el sistema de migraciones de Drizzle.

2. **Sintaxis SQL incorrecta:** Los archivos de migración contenían sintaxis no soportada por SQLite:
   - `datetime('now')` en lugar de `CURRENT_TIMESTAMP`
   - Faltaba `IF NOT EXISTS` en declaraciones `CREATE TABLE`
   - Uso de `ADD COLUMN IF NOT EXISTS` (no soportado en SQLite)

3. **Duplicación de definiciones:** La tabla `inventory_movements` estaba definida en múltiples archivos de migración.

## Solución Aplicada

### 1. Corrección de Sintaxis SQL

**Archivo:** `src-tauri/database/migrations/0002_add_cash_closing_tables.sql`

```sql
-- ❌ Antes
CREATE TABLE `inventory_movements` (
    `created_at` text DEFAULT datetime('now') NOT NULL,
    `updated_at` text DEFAULT datetime('now') NOT NULL
);

-- ✅ Después
CREATE TABLE IF NOT EXISTS `inventory_movements` (
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 2. Sincronización del Estado de Migraciones

**Archivo:** `src-tauri/database/migrations/meta/_journal.json`

- Agregadas entradas faltantes para todas las migraciones existentes
- Sincronizado el índice de migraciones con el estado real de la base de datos

### 3. Limpieza de Entradas Duplicadas

```sql
-- Eliminadas entradas duplicadas en __drizzle_migrations
DELETE FROM __drizzle_migrations
WHERE hash LIKE '%inventory_movements%'
   OR hash LIKE '%payment_method%'
   OR hash LIKE '%tx_fields%'
   OR hash LIKE '%customers%';
```

### 4. Eliminación de Conflictos

- Removida la parte problemática del ALTER TABLE en `cash_closings`
- Eliminadas declaraciones ALTER TABLE para columnas que ya existían

## Archivos Modificados

1. **`src-tauri/database/migrations/0002_add_cash_closing_tables.sql`**
   - Agregado `IF NOT EXISTS` a todas las declaraciones `CREATE TABLE`
   - Cambiado `datetime('now')` por `CURRENT_TIMESTAMP`
   - Eliminadas declaraciones ALTER TABLE problemáticas

2. **`src-tauri/database/migrations/meta/_journal.json`**
   - Agregadas entradas para todas las migraciones existentes
   - Sincronizado con el estado real de la base de datos

3. **`docs/database.md`**
   - Agregada sección "Solución de Problemas de Migraciones"
   - Documentados los pasos para resolver errores similares

## Verificación Post-Fix

```bash
# ✅ Migraciones ejecutándose correctamente
pnpm db:migrate
# [✓] migrations applied successfully!

# ✅ Todas las tablas creadas
sqlite3 src-tauri/pos.db ".tables"
# inventory_movements, inventory_stats, cash_sessions, etc.

# ✅ Estado de migraciones sincronizado
sqlite3 src-tauri/pos.db "SELECT * FROM __drizzle_migrations ORDER BY created_at;"
```

## Lecciones Aprendidas

1. **Sintaxis SQL:** SQLite tiene limitaciones específicas que deben considerarse al generar migraciones
2. **Sincronización:** El sistema de migraciones de Drizzle debe mantenerse sincronizado con el estado real de la base de datos
3. **Verificación:** Siempre verificar el estado de las migraciones antes de aplicar cambios

## Comandos de Verificación

```bash
# Verificar migraciones
pnpm db:migrate

# Verificar tablas existentes
sqlite3 src-tauri/pos.db ".tables"

# Verificar estado de migraciones
sqlite3 src-tauri/pos.db "SELECT * FROM __drizzle_migrations ORDER BY created_at;"

# Verificar estructura de tabla específica
sqlite3 src-tauri/pos.db ".schema inventory_movements"
```

## Estado Final

- ✅ **Migraciones funcionando correctamente**
- ✅ **Todas las tablas creadas sin errores**
- ✅ **Sistema de migraciones sincronizado**
- ✅ **Documentación actualizada**
- ✅ **Sin errores de sintaxis SQL**

---

**Nota:** Este fix resuelve problemas de migraciones que pueden ocurrir cuando hay inconsistencias entre el estado de la base de datos y el sistema de migraciones de Drizzle. La documentación actualizada en `docs/database.md` proporciona una guía para resolver problemas similares en el futuro.
