# 📋 Plan de Implementación - Gestión de Clientes

## 🎯 **Objetivo**
Implementar un sistema completo de gestión de clientes que permita:
- CRUD básico de clientes
- Integración con el sistema POS
- Reportes de clientes en cierre de caja
- Base para futuras funcionalidades de fidelización

---

## 📊 **Análisis de Requerimientos**

### **Funcionalidades Core (PRD Alineadas)**
- ✅ **Base de Datos:** Información básica, historial
- ✅ **Programa de Fidelidad:** Puntos básicos (local) - *Futuro*
- ✅ **Comunicación:** SMS/Email básico - *Futuro*

### **Funcionalidades Adicionales**
- ✅ **Integración POS:** Selección de cliente en ventas
- ✅ **Reportes:** Frecuencia, ticket promedio
- ✅ **Validación:** Esquemas Zod para datos consistentes

---

## 🏗️ **Arquitectura Técnica**

### **1. Base de Datos**
```sql
-- Tabla customers
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    document_type TEXT, -- 'cedula', 'rif', 'passport'
    document_number TEXT,
    birth_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla customer_sales (para historial)
CREATE TABLE customer_sales (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    sale_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (sale_id) REFERENCES sales(id)
);
```

### **2. Esquemas Zod**
```typescript
// app/schemas/customer.ts
export const CustomerSchema = z.object({
	id: z.string().uuid(),
	tenantId: z.string().default("default"),
	name: z.string().min(1).max(100),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	documentType: z.enum(["cedula", "rif", "passport"]).optional(),
	documentNumber: z.string().optional(),
	birthDate: z.date().optional(),
	notes: z.string().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const CreateCustomerSchema = CustomerSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
```

### **3. Composable useCustomers**
```typescript
// app/composables/useCustomers.ts
export const useCustomers = () => {
    const { db } = useDatabase();

    // CRUD operations
    const createCustomer = async (data: CreateCustomerInput) => { ... };
    const getCustomers = async () => { ... };
    const getCustomer = async (id: string) => { ... };
    const updateCustomer = async (id: string, data: UpdateCustomerInput) => { ... };
    const deleteCustomer = async (id: string) => { ... };

    // Business logic
    const getCustomerSales = async (customerId: string) => { ... };
    const getCustomerStats = async (customerId: string) => { ... };
    const searchCustomers = async (query: string) => { ... };

    return {
        createCustomer,
        getCustomers,
        getCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerSales,
        getCustomerStats,
        searchCustomers
    };
};
```

---

## 📋 **Plan de Implementación Detallado**

### **Fase 1: Base de Datos y Esquemas (1-2 días)**
- [ ] Crear migración para tabla `customers`
- [ ] Crear migración para tabla `customer_sales`
- [ ] Implementar esquemas Zod en `app/schemas/customer.ts`
- [ ] Actualizar tipos globales

### **Fase 2: Composable useCustomers (2-3 días)**
- [ ] Implementar CRUD básico
- [ ] Agregar funciones de búsqueda
- [ ] Implementar estadísticas de clientes
- [ ] Agregar validación de datos

### **Fase 3: Página de Gestión (2-3 días)**
- [ ] Crear página `/customers`
- [ ] Implementar formulario de creación/edición
- [ ] Agregar tabla de clientes con paginación
- [ ] Implementar búsqueda y filtros

### **Fase 4: Integración POS (2-3 días)**
- [ ] Modificar página POS para incluir selección de cliente
- [ ] Actualizar flujo de ventas para guardar cliente
- [ ] Modificar tabla `sales` para incluir `customer_id`
- [ ] Actualizar composable `usePOS`

### **Fase 5: Reportes y Cierre de Caja (1-2 días)**
- [ ] Agregar estadísticas de clientes en cierre de caja
- [ ] Implementar reportes de frecuencia de clientes
- [ ] Agregar ticket promedio por cliente
- [ ] Actualizar composable `useCashClosing`

### **Fase 6: Validación y Testing (1-2 días)**
- [ ] Probar todas las funcionalidades
- [ ] Validar integración con POS
- [ ] Verificar reportes de cierre de caja
- [ ] Actualizar documentación

---

## 🎯 **Criterios de Aceptación**

### **Funcionalidades Core**
- [ ] Crear, editar, eliminar clientes
- [ ] Buscar clientes por nombre, email, teléfono
- [ ] Seleccionar cliente en POS
- [ ] Ver historial de compras por cliente
- [ ] Reportes de clientes en cierre de caja

### **Validaciones**
- [ ] Email válido si se proporciona
- [ ] Teléfono válido si se proporciona
- [ ] Documento único por tipo
- [ ] Nombre requerido
- [ ] Datos consistentes en base de datos

### **Integración**
- [ ] POS funciona con y sin cliente seleccionado
- [ ] Cierre de caja incluye estadísticas de clientes
- [ ] Reportes exportables
- [ ] Interfaz responsive y accesible

---

## 📊 **Métricas de Éxito**

### **Técnicas**
- [ ] 0 errores de linting
- [ ] 100% cobertura de tipos TypeScript
- [ ] Todas las funciones probadas
- [ ] Base de datos consistente

### **Funcionales**
- [ ] CRUD completo funcionando
- [ ] Integración POS sin errores
- [ ] Reportes generándose correctamente
- [ ] Búsqueda rápida y eficiente

### **UX/UI**
- [ ] Interfaz intuitiva y fácil de usar
- [ ] Formularios con validación en tiempo real
- [ ] Mensajes de error claros
- [ ] Responsive en todos los dispositivos

---

## 🚀 **Próximos Pasos**

1. **Inmediato:** Crear migración de base de datos
2. **Corto plazo:** Implementar composable useCustomers
3. **Mediano plazo:** Crear página de gestión
4. **Largo plazo:** Integrar con POS y reportes

---

## 📝 **Notas de Implementación**

### **Consideraciones Técnicas**
- Usar UUIDs para IDs de clientes
- Implementar soft delete para clientes
- Agregar índices para búsquedas eficientes
- Validar datos en frontend y backend

### **Consideraciones de UX**
- Búsqueda en tiempo real
- Autocompletado en POS
- Formularios con validación visual
- Mensajes de confirmación claros

### **Consideraciones de Negocio**
- Clientes pueden estar inactivos
- Historial de compras preservado
- Reportes incluyen clientes inactivos
- Base para futuras funcionalidades de fidelización

---

*Este plan será actualizado conforme avance la implementación y se identifiquen nuevos requerimientos.*
