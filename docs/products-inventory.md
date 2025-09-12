# 📦 Gestión de Productos e Inventario

Este documento resume los flujos de gestión de productos, categorías y movimientos de inventario.

## Vistas y componentes

- Página de productos: `app/pages/products.vue`
- Página de categorías: `app/pages/categories.vue`
- Formulario de producto: `app/components/ProductForm.vue`
- Formulario de categoría: `app/components/CategoryForm.vue`
- Movimientos de inventario: `app/components/InventoryMovementForm.vue`
- Búsqueda de productos: `app/components/ProductSearchModal.vue`

## Composables

- `useProducts()` — carga, búsqueda, filtros, CRUD de productos
- `useCategories()` — carga y CRUD de categorías
- `useInventoryMovements()` — registro/consulta de movimientos (si aplica)

## Validaciones

- Esquemas Zod en `app/schemas/` (por ejemplo `schemas/product.ts`, `schemas/inventory.ts`).
- Reglas principales:
  - SKU requerido, único por tenant
  - Precio > 0, stock >= 0
  - Movimiento no puede dejar stock negativo

## Tipos de movimientos

- `entry` — Entrada a inventario
- `exit` — Salida de inventario
- `adjustment` — Ajuste manual
- `transfer` — Transferencia (futuro)
- `sale` — Venta (reduce stock)
- `return` — Devolución (aumenta stock)

El componente `InventoryMovementForm.vue` aplica la regla de signo:
- `entry` fuerza cantidad positiva
- `exit` fuerza cantidad negativa

Además calcula stock resultante y bloquea resultados < 0.

## Cálculo de stock

`newStock = previousStock + quantity`

Donde `quantity` ya incorpora el signo según el tipo de movimiento.

## Costos y valorización

- Campo `unitCost` opcional para `entry/adjustment`.
- Valor del movimiento: `unitCost * |quantity|`.

## Razones de movimiento

- Comunes por tipo (`COMMON_MOVEMENT_REASONS`).
- Opción de razón personalizada.

## Persistencia

- Tabla de movimientos (ver `app/database/schema/inventory.ts` si aplica) o consolidado en ventas.
- Actualización de `stock` en `products` bajo transacción.

