<template>
	<NuxtLayout name="pos">
		<div class="p-6">
			<!-- Header de la página -->
			<div class="mb-6">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold">
							Gestión de Categorías
						</h1>
						<p class="text-sm opacity-75 mt-1">
							Organiza tus productos por categorías
						</p>
					</div>
					<div class="flex items-center space-x-3">
						<UButton
							variant="outline"
							:loading="isLoading"
							@click="refreshCategories"
						>
							<UIcon name="i-heroicons-arrow-path" />
							Actualizar
						</UButton>
						<UButton
							color="primary"
							@click="showCreateModal = true"
						>
							<UIcon name="i-heroicons-plus" />
							Nueva Categoría
						</UButton>
					</div>
				</div>
			</div>

			<!-- Estadísticas -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Total Categorías
							</p>
							<p class="text-2xl font-bold">
								{{ categories.length }}
							</p>
						</div>
						<UIcon name="i-heroicons-tag" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Categorías Activas
							</p>
							<p class="text-2xl font-bold">
								{{ activeCategories }}
							</p>
						</div>
						<UIcon name="i-heroicons-check-circle" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm opacity-75">
								Productos Asignados
							</p>
							<p class="text-2xl font-bold">
								{{ totalProducts }}
							</p>
						</div>
						<UIcon name="i-heroicons-cube" class="w-8 h-8 opacity-50" />
					</div>
				</UCard>
			</div>

			<!-- Lista de categorías -->
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						Lista de Categorías
					</h3>
				</template>

				<div v-if="isLoading" class="flex justify-center items-center py-12">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
					<span class="ml-2">Cargando categorías...</span>
				</div>

				<div v-else-if="categories.length === 0" class="text-center py-12">
					<UIcon name="i-heroicons-tag" class="w-16 h-16 opacity-50 mx-auto mb-4" />
					<h3 class="text-lg font-medium mb-2">
						No hay categorías
					</h3>
					<p class="opacity-75 mb-4">
						Crea tu primera categoría para organizar tus productos
					</p>
					<UButton color="primary" @click="showCreateModal = true">
						<UIcon name="i-heroicons-plus" />
						Crear primera categoría
					</UButton>
				</div>

				<div v-else class="space-y-4">
					<div
						v-for="category in categories"
						:key="category.id"
						class="flex items-center justify-between p-4 border rounded-lg hover:opacity-75"
					>
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 rounded-lg border flex items-center justify-center">
								<UIcon name="i-heroicons-tag" class="w-6 h-6 opacity-50" />
							</div>
							<div>
								<h4 class="font-medium">
									{{ category.name }}
								</h4>
								<p v-if="category.description" class="text-sm opacity-75">
									{{ category.description }}
								</p>
								<p v-else class="text-sm opacity-50">
									Sin descripción
								</p>
							</div>
						</div>

						<div class="flex items-center space-x-4">
							<div class="text-right">
								<p class="text-sm font-medium">
									{{ category.productCount || 0 }} productos
								</p>
								<UBadge
									:color="category.isActive ? 'success' : 'error'"
									size="sm"
								>
									{{ category.isActive ? 'Activa' : 'Inactiva' }}
								</UBadge>
							</div>
							<div class="flex items-center space-x-2">
								<UButton
									variant="ghost"
									size="sm"
									@click="editCategory(category)"
								>
									<UIcon name="i-heroicons-pencil" />
								</UButton>
								<UButton
									variant="ghost"
									size="sm"
									color="error"
									@click="handleDeleteCategory(category)"
								>
									<UIcon name="i-heroicons-trash" />
								</UButton>
							</div>
						</div>
					</div>
				</div>
			</UCard>
		</div>

		<!-- Modal de crear/editar categoría -->
		<UModal
			v-model:open="showCreateModal"
			:title="editingCategory ? 'Editar Categoría' : 'Nueva Categoría'"
			:description="editingCategory ? 'Modifica la información de la categoría' : 'Crea una nueva categoría'"
			@close="closeModal"
		>
			<template #body>
				<CategoryForm
					:category="editingCategory"
					@submit="handleCategorySubmit"
					@cancel="closeModal"
				/>
			</template>
		</UModal>

		<!-- Modal de confirmación de eliminación -->
		<UModal
			v-model:open="showDeleteModal"
			title="Confirmar Eliminación"
			description="Esta acción no se puede deshacer"
			@close="showDeleteModal = false; categoryToDelete = null"
		>
			<template #body>
				<div class="space-y-4">
					<p>¿Estás seguro de que quieres eliminar esta categoría?</p>
					<div v-if="categoryToDelete" class="rounded-lg p-4 border">
						<h4 class="font-medium">
							{{ categoryToDelete.name }}
						</h4>
						<p class="text-sm opacity-75">
							{{ categoryToDelete.productCount || 0 }} productos asignados
						</p>
					</div>
					<p class="text-sm opacity-75">
						Los productos asignados a esta categoría quedarán sin categoría.
					</p>
				</div>
			</template>

			<template #footer>
				<div class="flex space-x-3">
					<UButton
						variant="outline"
						class="flex-1"
						@click="showDeleteModal = false"
					>
						Cancelar
					</UButton>
					<UButton
						color="error"
						class="flex-1"
						:loading="isDeleting"
						@click="confirmDelete"
					>
						Eliminar
					</UButton>
				</div>
			</template>
		</UModal>
	</NuxtLayout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useCategories } from "~/composables/useCategories";

	// Composables
	const {
		categories,
		loadCategories,
		createCategory,
		updateCategory,
		deleteCategory
	} = useCategories();

	// Estado local
	const isLoading = ref(false);
	const showCreateModal = ref(false);
	const showDeleteModal = ref(false);
	const editingCategory = ref(null);
	const categoryToDelete = ref(null);
	const isDeleting = ref(false);

	// Computed properties
	const activeCategories = computed(() => {
		return categories.value.filter((cat) => cat.isActive).length;
	});

	const totalProducts = computed(() => {
		return categories.value.reduce((total, cat) => total + (cat.productCount || 0), 0);
	});

	// Cargar datos iniciales
	onMounted(async () => {
		await loadCategories();
	});

	// Refrescar categorías
	const refreshCategories = async () => {
		isLoading.value = true;
		try {
			await loadCategories();
		} finally {
			isLoading.value = false;
		}
	};

	// Editar categoría
	const editCategory = (category: any) => {
		editingCategory.value = category;
		showCreateModal.value = true;
	};

	// Eliminar categoría
	const handleDeleteCategory = (category: any) => {
		categoryToDelete.value = category;
		showDeleteModal.value = true;
	};

	// Confirmar eliminación
	const confirmDelete = async () => {
		if (!categoryToDelete.value) return;

		isDeleting.value = true;
		try {
			await deleteCategory(categoryToDelete.value.id);
			showDeleteModal.value = false;
			categoryToDelete.value = null;
		} catch (error) {
			console.error("Error eliminando categoría:", error);
		} finally {
			isDeleting.value = false;
		}
	};

	// Manejar envío del formulario
	const handleCategorySubmit = async (categoryData: any) => {
		try {
			if (editingCategory.value) {
				await updateCategory(editingCategory.value.id, categoryData);
			} else {
				await createCategory(categoryData);
			}
			closeModal();
		} catch (error) {
			console.error("Error guardando categoría:", error);
		}
	};

	// Cerrar modal
	const closeModal = () => {
		showCreateModal.value = false;
		editingCategory.value = null;
	};

	// Meta de la página
	useHead({
		title: "Gestión de Categorías - POS Venezuela"
	});
</script>
