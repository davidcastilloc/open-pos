import { z } from "zod";

// Esquema base para cliente
export const CustomerSchema = z.object({
	id: z.string(),
	tenantId: z.string().default("default"),
	name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
	email: z.string().email("Email inválido").optional().or(z.literal("")),
	phone: z.string().optional().or(z.literal("")),
	address: z.string().optional().or(z.literal("")),
	documentType: z.enum(["cedula", "rif", "passport"]).optional(),
	documentNumber: z.string().optional().or(z.literal("")),
	birthDate: z.string().optional().or(z.literal("")), // ISO date string
	notes: z.string().optional().or(z.literal("")),
	isActive: z.boolean().default(true),
	createdAt: z.string(),
	updatedAt: z.string()
});

// Esquema para crear cliente (sin id, createdAt, updatedAt)
export const CreateCustomerSchema = CustomerSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

// Esquema para actualizar cliente (todos los campos opcionales excepto id)
export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
	id: z.string()
});

// Esquema para búsqueda de clientes
export const SearchCustomerSchema = z.object({
	query: z.string().min(1, "La búsqueda no puede estar vacía"),
	activeOnly: z.boolean().default(true)
});

// Esquema para estadísticas de cliente
export const CustomerStatsSchema = z.object({
	customerId: z.string(),
	totalSales: z.number().default(0),
	totalAmount: z.number().default(0),
	averageTicket: z.number().default(0),
	lastSaleDate: z.string().optional(),
	currency: z.string().default("BS")
});

// Tipos TypeScript derivados de los esquemas
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type SearchCustomerInput = z.infer<typeof SearchCustomerSchema>;
export type CustomerStats = z.infer<typeof CustomerStatsSchema>;
