import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tabla de usuarios/cajeros
export const users = sqliteTable("users", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	role: text("role", { enum: ["admin", "cashier", "manager"] }).notNull().default("cashier"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	passwordHash: text("password_hash").notNull(), // Para futuras implementaciones de autenticación
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Tipos TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Usuario por defecto para desarrollo
export const defaultUser: NewUser = {
	username: "admin",
	email: "admin@pos.local",
	firstName: "Administrador",
	lastName: "Sistema",
	role: "admin",
	isActive: true,
	passwordHash: "default_hash" // Temporal para desarrollo
};
