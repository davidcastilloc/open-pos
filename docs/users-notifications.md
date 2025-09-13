# 👤 Sistema de Usuarios y Notificaciones

## 📋 Resumen

El sistema POS incluye un sistema completo de gestión de usuarios/cajeros y notificaciones en tiempo real para mejorar la experiencia del usuario y la trazabilidad de las operaciones.

## 🔧 Componentes Implementados

### 1. **Sistema de Usuarios**

#### **Esquema de Base de Datos**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'cashier' NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### **Roles Disponibles**
- `admin`: Administrador del sistema
- `cashier`: Cajero/operador
- `manager`: Gerente/supervisor

#### **Composable useUser**
```typescript
const {
    currentUser,           // Usuario actual
    getCashierInfo,        // Información del cajero
    isAdmin,              // Es admin?
    isCashier,            // Es cajero?
    fullName,             // Nombre completo
    username,             // Nombre de usuario
    initializeUser,       // Inicializar usuario
    getAllUsers,          // Obtener todos los usuarios
    createUser,           // Crear nuevo usuario
    updateUser            // Actualizar usuario
} = useUser();
```

### 2. **Sistema de Notificaciones**

#### **Composable useNotifications**
```typescript
const {
    notifications,        // Lista de notificaciones
    addNotification,      // Agregar notificación
    removeNotification,   // Remover notificación
    clearAll,            // Limpiar todas
    success,             // Notificación de éxito
    error,               // Notificación de error
    warning,             // Notificación de advertencia
    info                 // Notificación informativa
} = useNotifications();
```

#### **Tipos de Notificaciones**
- **success**: Operaciones exitosas (auto-removible)
- **error**: Errores críticos (persistente)
- **warning**: Advertencias (auto-removible)
- **info**: Información general (auto-removible)

#### **Componente NotificationContainer**
- **Posicionamiento**: Esquina superior derecha
- **Animaciones**: Entrada/salida suaves
- **Auto-remoción**: Configurable por tipo
- **Botón de cierre**: Manual para notificaciones persistentes

## 🚀 Funcionalidades

### **Gestión de Usuarios**
1. **Inicialización automática**: Usuario admin por defecto
2. **Información dinámica**: Nombre del cajero en tiempo real
3. **Persistencia**: Sesiones guardadas en base de datos
4. **Roles**: Sistema de permisos por rol
5. **CRUD completo**: Crear, leer, actualizar usuarios

### **Sistema de Notificaciones**
1. **Feedback visual**: Para todas las operaciones
2. **Tiempo real**: Notificaciones instantáneas
3. **Persistencia**: Errores críticos no se auto-remueven
4. **Configuración**: Duración personalizable
5. **Integración**: En todas las páginas principales

## 📱 Integración en la Aplicación

### **Páginas Actualizadas**
- **POS (`/pos`)**: Notificaciones de ventas, errores de pago
- **Cierre de Caja (`/cash-closing`)**: Confirmaciones de reportes
- **Modal de Apertura de Caja**: Errores de sesión
- **Layouts**: NotificationContainer en default y pos

### **Composables Integrados**
- **useCashClosing**: Usuario actual en sesiones y reportes
- **usePOS**: Información del cajero en ventas
- **useCurrency**: Notificaciones de actualización de tasas

## 🔄 Flujo de Trabajo

### **Inicialización**
1. Plugin `user.client.ts` inicializa usuario automáticamente
2. Se crea usuario admin por defecto si no existe
3. Sistema de notificaciones se activa globalmente

### **Operaciones**
1. Usuario realiza acción (venta, cierre de caja, etc.)
2. Sistema valida permisos según rol
3. Se muestra notificación de confirmación/error
4. Información del usuario se registra en transacciones

## 🛠️ Configuración

### **Plugin de Usuario**
```typescript
// app/plugins/user.client.ts
export default defineNuxtPlugin(async () => {
    const { initializeUser } = useUser();
    await initializeUser();
});
```

### **Layouts con Notificaciones**
```vue
<!-- app/layouts/default.vue y pos.vue -->
<NotificationContainer />
```

## 📊 Beneficios

1. **Trazabilidad**: Todas las operaciones tienen usuario asociado
2. **Experiencia de Usuario**: Feedback visual inmediato
3. **Seguridad**: Sistema de roles y permisos
4. **Mantenibilidad**: Código limpio sin TODOs
5. **Escalabilidad**: Base para futuras funcionalidades

## 🔮 Futuras Mejoras

- **Autenticación**: Login/logout con contraseñas
- **Permisos granulares**: Por funcionalidad específica
- **Auditoría**: Log completo de acciones por usuario
- **Notificaciones push**: Para eventos importantes
- **Multi-tenant**: Soporte para múltiples tiendas
