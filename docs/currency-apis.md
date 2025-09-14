# 💱 APIs de Tasas de Cambio

## 📋 Resumen

El sistema POS incluye integración completa con APIs externas para obtener tasas de cambio en tiempo real, con fallback automático y persistencia en base de datos.

## 🌐 APIs Integradas

### 1. **Banco Central de Venezuela (BCV)**
- **Endpoint**: `https://bcv.org.ve/api/exchange`
- **Método**: GET
- **Timeout**: 10 segundos
- **Formato**: JSON con tasas oficiales

### 2. **DolarToday**
- **Endpoint**: `https://s3.amazonaws.com/dolartoday/data.json`
- **Método**: GET
- **Timeout**: 10 segundos
- **Formato**: JSON con tasas del mercado paralelo

## 🔧 Implementación

### **Composable useCurrency Actualizado**

#### **Funciones de API**
```typescript
const {
    fetchBCVRates,           // Obtener tasas del BCV
    fetchDolarTodayRates,    // Obtener tasas de DolarToday
    saveExchangeRate,        // Guardar tasa en BD
    loadLatestRatesFromDB,   // Cargar tasas más recientes
    getRateHistory,          // Obtener historial
    updateManualRate         // Actualizar manualmente
} = useCurrency();
```

#### **Flujo de Actualización**
1. **Intento BCV**: Obtener tasas oficiales
2. **Intento DolarToday**: Obtener tasas paralelas
3. **Fallback**: Usar tasas por defecto si fallan ambas
4. **Persistencia**: Guardar en base de datos
5. **Notificación**: Informar resultado al usuario

### **Manejo de Errores**
```typescript
try {
    const response = await $fetch("https://bcv.org.ve/api/exchange", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "User-Agent": "POS-Venezuela/1.0"
        },
        timeout: 10000
    });
    // Procesar respuesta exitosa
} catch (err) {
    console.error("Error fetching BCV rates:", err);
    // Fallback a tasas por defecto
    exchangeRates.value.USD = { /* tasa por defecto */ };
}
```

## 💾 Persistencia en Base de Datos

### **Tabla exchange_rates**
```sql
CREATE TABLE exchange_rates (
    id TEXT PRIMARY KEY,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    source TEXT NOT NULL,
    date TEXT NOT NULL,
    is_valid INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### **Funciones de Persistencia**
- **saveExchangeRate()**: Guardar nueva tasa
- **loadLatestRatesFromDB()**: Cargar tasas más recientes
- **getRateHistory()**: Obtener historial por período

## 🔄 Flujo de Trabajo

### **Inicialización**
1. Cargar tasas más recientes desde BD
2. Intentar actualizar desde APIs externas
3. Aplicar fallback si es necesario
4. Mostrar estado al usuario

### **Actualización Automática**
1. **Intervalo configurable**: Cada 15 minutos por defecto
2. **Múltiples fuentes**: BCV y DolarToday
3. **Validación**: Verificar formato y valores
4. **Persistencia**: Guardar en BD automáticamente

### **Actualización Manual**
1. Usuario solicita actualización
2. Ejecutar fetchBCVRates() y fetchDolarTodayRates()
3. Mostrar notificación de resultado
4. Actualizar interfaz en tiempo real

## 📊 Tipos de Datos

### **Estructura de Tasa de Cambio**
```typescript
interface ExchangeRate {
    id: string;
    fromCurrency: "BS" | "USD" | "EUR";
    toCurrency: "BS" | "USD" | "EUR";
    rate: number;
    source: "BCV" | "DOLAR_TODAY" | "MANUAL" | "FALLBACK";
    date: string;
    isValid: boolean;
    createdAt: string;
}
```

### **Fuentes de Datos**
- **BCV**: Tasas oficiales del gobierno
- **DOLAR_TODAY**: Tasas del mercado paralelo
- **MANUAL**: Tasas ingresadas manualmente
- **FALLBACK**: Tasas por defecto cuando fallan las APIs

## 🎯 Beneficios

### **Para el Usuario**
1. **Tasas actualizadas**: Información en tiempo real
2. **Múltiples fuentes**: BCV oficial y mercado paralelo
3. **Fallback automático**: Sistema siempre funcional
4. **Historial**: Consulta de tasas anteriores

### **Para el Sistema**
1. **Confiabilidad**: Múltiples fuentes de datos
2. **Persistencia**: Historial completo en BD
3. **Performance**: Cache local de tasas
4. **Escalabilidad**: Fácil agregar nuevas fuentes

## 🛠️ Configuración

### **Variables de Entorno**
```env
# APIs de tasas de cambio
BCV_API_URL=https://bcv.org.ve/api/exchange
DOLARTODAY_API_URL=https://s3.amazonaws.com/dolartoday/data.json
CURRENCY_UPDATE_INTERVAL=15  # minutos
CURRENCY_TIMEOUT=10000       # milisegundos
```

### **Configuración por Defecto**
- **Intervalo de actualización**: 15 minutos
- **Timeout**: 10 segundos
- **Tasas por defecto**: USD=36.5, EUR=31.0
- **Auto-actualización**: Habilitada

## 🔮 Futuras Mejoras

### **Nuevas Fuentes**
- **Binance**: Tasas de criptomonedas
- **Fixer.io**: API internacional
- **ExchangeRate-API**: Fuente alternativa

### **Funcionalidades Avanzadas**
- **Alertas**: Notificar cambios significativos
- **Gráficos**: Visualización de tendencias
- **Predicciones**: Análisis de patrones
- **API propia**: Exponer tasas a otros sistemas

## 📈 Métricas y Monitoreo

### **Indicadores de Salud**
- **Tasa de éxito**: % de actualizaciones exitosas
- **Tiempo de respuesta**: Latencia de las APIs
- **Disponibilidad**: Uptime de las fuentes
- **Precisión**: Comparación entre fuentes

### **Logs y Debugging**
```typescript
console.log("✅ BCV rates updated:", { USD: usdRate, EUR: eurRate });
console.error("❌ Error fetching DolarToday rates:", err);
console.log("🔄 Loading latest rates from database");
```

## 🚨 Consideraciones de Seguridad

1. **Rate Limiting**: Respetar límites de las APIs
2. **User-Agent**: Identificar la aplicación
3. **Timeout**: Evitar bloqueos por APIs lentas
4. **Validación**: Verificar formato de respuestas
5. **Fallback**: Siempre tener tasas de respaldo
