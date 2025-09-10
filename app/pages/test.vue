<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">🧪 Página de Prueba - Sistema POS</h1>
    
    <!-- Estado de la Base de Datos -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">🗄️ Estado de la Base de Datos</h2>
      </template>
      
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <UIcon :name="isReady ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                 :class="isReady ? 'text-green-500' : 'text-red-500'" />
          <span>Base de datos: {{ isReady ? 'Lista' : 'No inicializada' }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <UIcon :name="isLoading ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'" 
                 :class="isLoading ? 'text-blue-500 animate-spin' : 'text-green-500'" />
          <span>Cargando: {{ isLoading ? 'Sí' : 'No' }}</span>
        </div>
        
        <div v-if="error" class="text-red-500">
          Error: {{ error }}
        </div>
      </div>
    </UCard>

    <!-- Configuración -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">⚙️ Configuración del Sistema</h2>
      </template>
      
      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-2">Monedas Soportadas:</h3>
          <div class="flex gap-2">
            <UBadge v-for="currency in getCurrencyConfig.supportedCurrencies" 
                    :key="currency" 
                    :color="currency === getCurrencyConfig.defaultCurrency ? 'primary' : 'gray'">
              {{ currency }}
            </UBadge>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">Moneda por Defecto:</h3>
          <UBadge color="primary">{{ getCurrencyConfig.defaultCurrency }}</UBadge>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">Fuentes de Tasas de Cambio:</h3>
          <div class="space-y-1">
            <div v-for="source in getCurrencyConfig.exchangeRateSources" 
                 :key="source.name" 
                 class="flex items-center gap-2">
              <UIcon :name="source.isActive ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                     :class="source.isActive ? 'text-green-500' : 'text-red-500'" />
              <span>{{ source.name }} (Prioridad: {{ source.priority }})</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Tasas de Cambio -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">💱 Tasas de Cambio</h2>
      </template>
      
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <UButton @click="refreshRates" :loading="currencyLoading">
            <UIcon name="i-heroicons-arrow-path" />
            Actualizar Tasas
          </UButton>
          
          <span class="text-sm text-gray-500">
            Última actualización: {{ lastUpdateFormatted }}
          </span>
        </div>
        
        <div v-if="currencyError" class="text-red-500">
          Error: {{ currencyError }}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="rate in currentRates" :key="rate.id" class="p-4 border rounded-lg">
            <div class="font-medium">{{ rate.fromCurrency }} → {{ rate.toCurrency }}</div>
            <div class="text-2xl font-bold text-primary">{{ rate.rate.toFixed(4) }}</div>
            <div class="text-sm text-gray-500">{{ rate.source }}</div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Prueba de Conversión -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">🔄 Prueba de Conversión</h2>
      </template>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormGroup label="Cantidad">
            <UInput v-model="testAmount" type="number" placeholder="100" />
          </UFormGroup>
          
          <UFormGroup label="De">
            <USelect v-model="testFrom" :options="currencyOptions" />
          </UFormGroup>
          
          <UFormGroup label="A">
            <USelect v-model="testTo" :options="currencyOptions" />
          </UFormGroup>
        </div>
        
        <div v-if="convertedAmount !== null" class="p-4 bg-gray-50 rounded-lg">
          <div class="text-lg">
            {{ formatCurrency(testAmount, testFrom) }} = 
            <span class="font-bold text-primary">{{ formatCurrency(convertedAmount, testTo) }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Impuestos -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">📊 Configuración de Impuestos</h2>
      </template>
      
      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-2">IVA:</h3>
          <div class="flex items-center gap-2">
            <UBadge :color="getTaxConfig.iva.isActive ? 'green' : 'red'">
              {{ (getTaxConfig.iva.rate * 100).toFixed(1) }}%
            </UBadge>
            <span class="text-sm text-gray-500">{{ getTaxConfig.iva.description }}</span>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">ISLR:</h3>
          <div class="flex items-center gap-2">
            <UBadge :color="getTaxConfig.islr.isActive ? 'green' : 'red'">
              {{ (getTaxConfig.islr.rate * 100).toFixed(1) }}%
            </UBadge>
            <span class="text-sm text-gray-500">{{ getTaxConfig.islr.description }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Composables
const { isReady, isLoading, error } = useDatabase()
const { getCurrencyConfig, getTaxConfig } = useConfig()
const { 
  currentRates, 
  isLoading: currencyLoading, 
  error: currencyError, 
  lastUpdateFormatted,
  fetchCurrentRates,
  convertAmount,
  formatCurrency
} = useCurrency()

// Estado para prueba de conversión
const testAmount = ref(100)
const testFrom = ref('USD')
const testTo = ref('BS')

// Opciones de monedas
const currencyOptions = [
  { label: 'Bolívares (BS)', value: 'BS' },
  { label: 'Dólares (USD)', value: 'USD' },
  { label: 'Euros (EUR)', value: 'EUR' }
]

// Conversión calculada
const convertedAmount = computed(() => {
  if (!testAmount.value || !testFrom.value || !testTo.value) return null
  return convertAmount(testAmount.value, testFrom.value, testTo.value)
})

// Función para actualizar tasas
const refreshRates = async () => {
  await fetchCurrentRates()
}

// Meta de la página
useHead({
  title: 'Prueba del Sistema POS'
})
</script>
