import { sqliteTable, text, real, integer, blob } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku').notNull(),
  barcode: text('barcode'),
  price: real('price').notNull(),
  cost: real('cost').notNull(),
  categoryId: text('category_id'),
  stock: integer('stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  images: text('images'), // JSON string
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  syncedAt: text('synced_at')
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
