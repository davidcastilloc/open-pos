import { ref, computed } from 'vue'
import { z } from 'zod'

// Schema de configuración base
export const ConfigSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  category: z.enum(['general', 'currency', 'accounts', 'taxes', 'reports', 'integrations']),
  key: z.string(),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  isEditable: z.boolean().default(true),
  isRequired: z.boolean().default(false),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    options: z.array(z.string()).optional()
  }).optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Config = z.infer<typeof ConfigSchema>

// Configuración por defecto para Venezuela
export const defaultConfig: Record<string, any> = {
  general: {
    appName: 'POS Venezuela',
    appVersion: '1.0.0',
    defaultLanguage: 'es',
    timezone: 'America/Caracas'
  },
  currency: {
    defaultCurrency: 'BS',
    supportedCurrencies: ['BS', 'USD', 'EUR'],
    exchangeRateSources: [
      { name: 'BCV', priority: 1, url: 'https://api.bcv.org.ve', isActive: true },
      { name: 'DolarToday', priority: 2, url: 'https://s3.amazonaws.com/dolartoday', isActive: true },
      { name: 'Manual', priority: 3, url: null, isActive: true }
    ],
    updateInterval: 15,
    autoUpdate: true
  },
  taxes: {
    iva: { rate: 0.16, isActive: true, description: 'Impuesto al Valor Agregado' },
    islr: { rate: 0.02, isActive: true, description: 'Impuesto Sobre la Renta' },
    customTaxes: []
  },
  accounts: {
    defaultAccounts: [
      { name: 'Caja Principal BS', type: 'cash', currency: 'BS', isDefault: true },
      { name: 'Caja Principal USD', type: 'cash', currency: 'USD', isDefault: true },
      { name: 'Banco BS', type: 'bank', currency: 'BS', isDefault: true },
      { name: 'Banco USD', type: 'bank', currency: 'USD', isDefault: true }
    ],
    requireApproval: { transfers: true, adjustments: true, expenses: false },
    autoReconciliation: true,
    reconciliationInterval: 24
  },
  reports: {
    formats: {
      date: 'DD/MM/YYYY',
      time: 'HH:mm:ss',
      number: {
        BS: { decimals: 2, separator: ',', thousands: '.' },
        USD: { decimals: 2, separator: '.', thousands: ',' },
        EUR: { decimals: 2, separator: ',', thousands: '.' }
      }
    },
    exports: {
      defaultFormat: 'PDF',
      availableFormats: ['PDF', 'Excel', 'CSV', 'JSON'],
      includeCharts: true,
      includeDetails: true
    },
    schedules: {
      dailyReports: true,
      weeklyReports: true,
      monthlyReports: true,
      autoEmail: false
    }
  }
}

export function useConfig() {
  const config = ref<Record<string, any>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Cargar configuración
  const loadConfig = async (category?: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Por ahora usamos configuración por defecto
      // En el futuro esto vendrá de la base de datos
      if (category) {
        config.value[category] = defaultConfig[category] || {}
      } else {
        config.value = { ...defaultConfig }
      }
    } catch (err) {
      error.value = 'Error al cargar configuración'
      console.error('Error loading config:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Actualizar configuración
  const updateConfig = async (category: string, key: string, value: any) => {
    try {
      // Por ahora solo actualizamos en memoria
      // En el futuro esto se guardará en la base de datos
      if (!config.value[category]) {
        config.value[category] = {}
      }
      config.value[category][key] = value
      
      console.log(`Config updated: ${category}.${key} = ${value}`)
    } catch (err) {
      error.value = 'Error al actualizar configuración'
      console.error('Error updating config:', err)
    }
  }

  // Validar configuración
  const validateConfig = (category: string, key: string, value: any) => {
    const configItem = config.value[category]?.[key]
    if (!configItem?.validation) return true

    const { min, max, pattern, options } = configItem.validation

    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    if (pattern && !new RegExp(pattern).test(value)) return false
    if (options && !options.includes(value)) return false

    return true
  }

  // Resetear a valores por defecto
  const resetToDefault = async (category: string, key: string) => {
    const defaultValue = defaultConfig[category]?.[key]
    
    if (defaultValue !== undefined) {
      await updateConfig(category, key, defaultValue)
    }
  }

  // Obtener configuración específica
  const getConfig = (category: string, key: string) => {
    return config.value[category]?.[key]
  }

  // Obtener configuración de moneda
  const getCurrencyConfig = computed(() => {
    return config.value.currency || defaultConfig.currency
  })

  // Obtener configuración de impuestos
  const getTaxConfig = computed(() => {
    return config.value.taxes || defaultConfig.taxes
  })

  // Obtener configuración de cuentas
  const getAccountConfig = computed(() => {
    return config.value.accounts || defaultConfig.accounts
  })

  return {
    config: readonly(config),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadConfig,
    updateConfig,
    validateConfig,
    resetToDefault,
    getConfig,
    getCurrencyConfig,
    getTaxConfig,
    getAccountConfig
  }
}
