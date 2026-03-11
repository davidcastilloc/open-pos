<template>
	<NuxtLayout name="default">
		<div class="p-6">
			<div class="max-w-6xl mx-auto">
				<h1 class="text-3xl font-bold mb-6">
					Consulta de Tabla de Productos
				</h1>

				<!-- Estado de carga -->
				<div v-if="isLoading" class="flex justify-center items-center py-12">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Consultando productos...</span>
				</div>

				<!-- Error -->
				<div v-else-if="error" class="border rounded-lg p-4 mb-6">
					<div class="flex items-center">
						<UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-error mr-2" />
						<span class="text-error">{{ error }}</span>
					</div>
				</div>

				<!-- Resultados -->
				<div v-else-if="products.length > 0">
					<div class="rounded-lg border shadow-sm overflow-hidden">
						<div class="px-6 py-4 border-b">
							<div class="flex items-center justify-between">
								<h2 class="text-lg font-semibold">
									Productos encontrados: {{ products.length }}
								</h2>
								<UButton
									variant="outline"
									size="sm"
									:loading="isLoading"
									@click="consultarProductos"
								>
									<UIcon name="i-heroicons-arrow-path" />
									Actualizar
								</UButton>
							</div>
						</div>

						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											ID
										</th>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											Nombre
										</th>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											SKU
										</th>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											Código de Barras
										</th>
										<th class="px-4 py-3 text-right text-xs font-medium opacity-75 uppercase tracking-wider">
											Precio
										</th>
										<th class="px-4 py-3 text-right text-xs font-medium opacity-75 uppercase tracking-wider">
											Costo
										</th>
										<th class="px-4 py-3 text-right text-xs font-medium opacity-75 uppercase tracking-wider">
											Stock
										</th>
										<th class="px-4 py-3 text-right text-xs font-medium opacity-75 uppercase tracking-wider">
											Stock Mín.
										</th>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											Categoría
										</th>
										<th class="px-4 py-3 text-center text-xs font-medium opacity-75 uppercase tracking-wider">
											Activo
										</th>
										<th class="px-4 py-3 text-left text-xs font-medium opacity-75 uppercase tracking-wider">
											Creado
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200">
									<tr v-for="product in products" :key="product.id" class="hover:opacity-75">
										<td class="px-4 py-3 text-sm font-mono ">
											{{ product.id }}
										</td>
										<td class="px-4 py-3 text-sm">
											<div>
												<div class="font-medium ">
													{{ product.name }}
												</div>
												<div v-if="product.description" class="text-sm opacity-75">
													{{ product.description }}
												</div>
											</div>
										</td>
										<td class="px-4 py-3 text-sm font-mono ">
											{{ product.sku }}
										</td>
										<td class="px-4 py-3 text-sm font-mono ">
											{{ product.barcode || '-' }}
										</td>
										<td class="px-4 py-3 text-sm text-right font-semibold">
											{{ formatPrice(product.price, product.currency) }}
										</td>
										<td class="px-4 py-3 text-sm text-right ">
											{{ formatPrice(product.cost, product.currency) }}
										</td>
										<td class="px-4 py-3 text-sm text-right">
											<span :class="getStockClass(product.stock, product.min_stock)">
												{{ product.stock }}
											</span>
										</td>
										<td class="px-4 py-3 text-sm text-right ">
											{{ product.min_stock }}
										</td>
										<td class="px-4 py-3 text-sm ">
											{{ product.category_id || '-' }}
										</td>
										<td class="px-4 py-3 text-center">
										<UBadge :color="product.is_active ? 'success' : 'error'" size="sm">
												{{ product.is_active ? 'Sí' : 'No' }}
											</UBadge>
										</td>
										<td class="px-4 py-3 text-sm opacity-75">
											{{ formatDate(product.created_at) }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- Sin productos -->
				<div v-else class="text-center py-12">
					<UIcon name="i-heroicons-cube" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">
						No hay productos en la base de datos
					</h3>
					<p class="opacity-75 mb-4">
						La tabla de productos está vacía
					</p>
					<UButton variant="outline" @click="consultarProductos">
						<UIcon name="i-heroicons-arrow-path" />
						Intentar nuevamente
					</UButton>
				</div>

				<!-- Información de la base de datos -->
				<div class="mt-8 border rounded-lg p-4">
					<h3 class="text-lg font-semibold mb-2">
						Información de la Base de Datos
					</h3>
					<div class="text-sm space-y-1">
						<p><strong>Archivo:</strong> pos.db (SQLite)</p>
						<p><strong>Tabla:</strong> products</p>
						<p><strong>Tenant ID:</strong> default</p>
						<p><strong>Consultado el:</strong> {{ new Date().toLocaleString() }}</p>
					</div>
				</div>
			</div>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { useCurrency } from "~/composables/useCurrency";
	import { useDatabase } from "~/composables/useDatabase";

	// Composables
	const { query, initialize } = useDatabase();
	const { formatCurrency } = useCurrency();

	// Estado
	const products = ref<any[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Consultar productos
	const consultarProductos = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			// Asegurar que la base de datos esté inicializada
			await initialize();

			// Consultar todos los productos
			const results = await query<any>(`
			SELECT p.*, c.name as category_name
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			ORDER BY p.created_at DESC
		`);

			products.value = results.rows;
			console.log("✅ Productos consultados:", results.rows.length);
		} catch (err) {
			error.value = "Error al consultar la base de datos";
			console.error("❌ Error consultando productos:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Formatear precio
	const formatPrice = (amount: number, currency: string = "BS") => {
		return formatCurrency(amount, currency);
	};

	// Formatear fecha
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString("es-VE", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		} catch {
			return dateString;
		}
	};

	// Obtener clase CSS para stock
	const getStockClass = (stock: number, minStock: number) => {
		if (stock === 0) return "text-error font-semibold";
		if (stock <= minStock) return "text-warning font-semibold";
		return "text-success font-semibold";
	};

	// Cargar datos al montar el componente
	onMounted(() => {
		consultarProductos();
	});
</script>
