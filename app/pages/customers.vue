<template>
	<div class="min-h-screen">
		<!-- Header -->
		<div class="shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center py-6">
					<div>
						<h1 class="text-2xl font-bold">
							Gestión de Clientes
						</h1>
						<p class="mt-1 text-sm opacity-75">
							Administra la información de tus clientes
						</p>
					</div>
					<UButton
						icon="i-heroicons-plus"
						color="primary"
						size="lg"
						@click="openCreateModal"
					>
						Nuevo Cliente
					</UButton>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-users" class="h-8 w-8" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">
								Total Clientes
							</p>
							<p class="text-2xl font-semibold text-gray-900">
								{{ totalCustomers }}
							</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-user-check" class="h-8 w-8 text-green-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">
								Clientes Activos
							</p>
							<p class="text-2xl font-semibold text-gray-900">
								{{ activeCustomers.length }}
							</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-user-minus" class="h-8 w-8 text-gray-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">
								Clientes Inactivos
							</p>
							<p class="text-2xl font-semibold text-gray-900">
								{{ inactiveCustomers.length }}
							</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-purple-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">
								Búsquedas
							</p>
							<p class="text-2xl font-semibold text-gray-900">
								{{ searchResults.length }}
							</p>
						</div>
					</div>
				</UCard>
			</div>

			<!-- Filters and Search -->
			<UCard class="mb-6">
				<div class="flex flex-col sm:flex-row gap-4">
					<div class="flex-1">
						<UInput
							v-model="searchQuery"
							placeholder="Buscar por nombre, email, teléfono o documento..."
							icon="i-heroicons-magnifying-glass"
							@input="handleSearch"
						/>
					</div>
					<div class="flex gap-2">
						<USelect
							v-model="statusFilter"
							:options="statusOptions"
							placeholder="Estado"
							@change="handleFilter"
						/>
						<UButton
							variant="outline"
							icon="i-heroicons-x-mark"
							@click="clearFilters"
						>
							Limpiar
						</UButton>
					</div>
				</div>
			</UCard>

			<!-- Customers Table -->
			<UCard>
				<div v-if="loading" class="flex justify-center py-8">
					<UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-blue-600" />
				</div>

				<div v-else-if="error" class="text-center py-8">
					<UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p class="text-red-600">
						{{ error }}
					</p>
					<UButton class="mt-4" color="error" variant="outline" @click="loadCustomers">
						Reintentar
					</UButton>
				</div>

				<div v-else-if="displayedCustomers.length === 0" class="text-center py-8">
					<UIcon name="i-heroicons-users" class="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p class="opacity-75">
						No se encontraron clientes
					</p>
					<UButton class="mt-4" color="primary" @click="openCreateModal">
						Crear Primer Cliente
					</UButton>
				</div>

				<div v-else>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y">
							<thead>
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider opacity-75">
										Cliente
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider opacity-75">
										Contacto
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider opacity-75">
										Documento
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider opacity-75">
										Estado
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider opacity-75">
										Fecha de Registro
									</th>
									<th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider opacity-75">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody class="divide-y">
								<tr v-for="customer in displayedCustomers" :key="customer.id" class="hover:opacity-75">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<div class="flex-shrink-0 h-10 w-10">
												<div class="h-10 w-10 rounded-full border flex items-center justify-center">
													<UIcon name="i-heroicons-user" class="h-6 w-6" />
												</div>
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium">
													{{ customer.name }}
												</div>
												<div v-if="customer.notes" class="text-sm opacity-75 truncate max-w-xs">
													{{ customer.notes }}
												</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm">
											<div v-if="customer.email" class="flex items-center">
												<UIcon name="i-heroicons-envelope" class="h-4 w-4 mr-2 opacity-50" />
												{{ customer.email }}
											</div>
											<div v-if="customer.phone" class="flex items-center mt-1">
												<UIcon name="i-heroicons-phone" class="h-4 w-4 mr-2 opacity-50" />
												{{ customer.phone }}
											</div>
											<div v-if="customer.address" class="flex items-center mt-1">
												<UIcon name="i-heroicons-map-pin" class="h-4 w-4 mr-2 opacity-50" />
												<span class="truncate max-w-xs">{{ customer.address }}</span>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div v-if="customer.documentType && customer.documentNumber" class="text-sm">
											<div class="font-medium">
												{{ getDocumentTypeLabel(customer.documentType) }}
											</div>
											<div class="opacity-75">
												{{ customer.documentNumber }}
											</div>
										</div>
										<div v-else class="text-sm opacity-50">
											Sin documento
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<UBadge :color="customer.isActive ? 'success' : 'neutral'" variant="subtle">
											{{ customer.isActive ? 'Activo' : 'Inactivo' }}
										</UBadge>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm opacity-75">
										{{ formatDate(customer.createdAt || '') }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div class="flex justify-end gap-2">
											<UButton icon="i-heroicons-eye" size="sm" variant="ghost" color="primary" @click="viewCustomer(customer)">
												Ver
											</UButton>
											<UButton icon="i-heroicons-pencil" size="sm" variant="ghost" color="warning" @click="editCustomer(customer)">
												Editar
											</UButton>
											<UButton icon="i-heroicons-trash" size="sm" variant="ghost" color="error" @click="requestDeleteCustomer(customer)">
												Eliminar
											</UButton>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</UCard>
		</div>

		<!-- Create/Edit Modal -->
		<UModal v-model:open="isModalOpen">
			<template #content>
				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
							</h3>
							<UButton
								icon="i-heroicons-x-mark"
								variant="ghost"
								color="neutral"
								@click="closeModal"
							/>
						</div>
					</template>

					<UForm
						:schema="customerSchema"
						:state="formState"
						class="space-y-4"
						@submit="handleSubmit"
					>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<UFormGroup label="Nombre *" name="name">
								<UInput v-model="formState.name" placeholder="Nombre completo" />
							</UFormGroup>

							<UFormGroup label="Email" name="email">
								<UInput v-model="formState.email" type="email" placeholder="email@ejemplo.com" />
							</UFormGroup>

							<UFormGroup label="Teléfono" name="phone">
								<UInput v-model="formState.phone" placeholder="+58 412 123 4567" />
							</UFormGroup>

							<UFormGroup label="Tipo de Documento" name="documentType">
								<USelect
									v-model="formState.documentType"
									:options="documentTypeOptions"
									placeholder="Seleccionar tipo"
								/>
							</UFormGroup>

							<UFormGroup label="Número de Documento" name="documentNumber">
								<UInput v-model="formState.documentNumber" placeholder="V-12345678" />
							</UFormGroup>

							<UFormGroup label="Fecha de Nacimiento" name="birthDate">
								<UInput v-model="formState.birthDate" type="date" />
							</UFormGroup>
						</div>

						<UFormGroup label="Dirección" name="address">
							<UTextarea v-model="formState.address" placeholder="Dirección completa" />
						</UFormGroup>

						<UFormGroup label="Notas" name="notes">
							<UTextarea v-model="formState.notes" placeholder="Notas adicionales sobre el cliente" />
						</UFormGroup>

						<UFormGroup label="Estado" name="isActive">
							<UToggle v-model="formState.isActive" />
							<span class="ml-2 text-sm opacity-75">
								{{ formState.isActive ? 'Cliente activo' : 'Cliente inactivo' }}
							</span>
						</UFormGroup>
					</UForm>
					<template #footer>
						<div class="flex justify-end gap-3">
							<UButton variant="outline" @click="closeModal">
								Cancelar
							</UButton>
							<UButton :loading="loading" color="primary" @click="handleSubmit">
								{{ isEditing ? 'Actualizar' : 'Crear' }} Cliente
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>

		<!-- View Modal -->
		<UModal v-model:open="isViewModalOpen">
			<template #content>
				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								Detalles del Cliente
							</h3>
							<UButton
								icon="i-heroicons-x-mark"
								variant="ghost"
								color="neutral"
								@click="closeViewModal"
							/>
						</div>
					</template>

					<div v-if="selectedCustomer" class="space-y-6">
						<!-- Basic Info -->
						<div class="flex items-start space-x-4">
							<div class="flex-shrink-0">
								<div class="h-16 w-16 rounded-full border flex items-center justify-center">
									<UIcon name="i-heroicons-user" class="h-8 w-8" />
								</div>
							</div>
							<div class="flex-1">
								<h4 class="text-xl font-semibold">
									{{ selectedCustomer.name }}
								</h4>
								<p class="text-sm opacity-75">
									Registrado el {{ formatDate(selectedCustomer.createdAt) }}
								</p>
								<UBadge :color="selectedCustomer.isActive ? 'success' : 'neutral'" variant="subtle" class="mt-2">
									{{ selectedCustomer.isActive ? 'Activo' : 'Inactivo' }}
								</UBadge>
							</div>
						</div>

						<!-- Contact Info -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h5 class="text-sm font-medium mb-3">
									Información de Contacto
								</h5>
								<div class="space-y-2">
									<div v-if="selectedCustomer.email" class="flex items-center">
										<UIcon name="i-heroicons-envelope" class="h-4 w-4 mr-2 opacity-50" />
										<span class="text-sm opacity-75">{{ selectedCustomer.email }}</span>
									</div>
									<div v-if="selectedCustomer.phone" class="flex items-center">
										<UIcon name="i-heroicons-phone" class="h-4 w-4 mr-2 opacity-50" />
										<span class="text-sm opacity-75">{{ selectedCustomer.phone }}</span>
									</div>
									<div v-if="selectedCustomer.address" class="flex items-center">
										<UIcon name="i-heroicons-map-pin" class="h-4 w-4 mr-2 opacity-50" />
										<span class="text-sm opacity-75">{{ selectedCustomer.address }}</span>
									</div>
								</div>
							</div>

							<div>
								<h5 class="text-sm font-medium mb-3">
									Documento
								</h5>
								<div v-if="selectedCustomer.documentType && selectedCustomer.documentNumber" class="space-y-2">
									<div class="text-sm opacity-75">
										<span class="font-medium">{{ getDocumentTypeLabel(selectedCustomer.documentType) }}:</span>
										{{ selectedCustomer.documentNumber }}
									</div>
									<div v-if="selectedCustomer.birthDate" class="text-sm opacity-75">
										<span class="font-medium">Fecha de Nacimiento:</span>
										{{ formatDate(selectedCustomer.birthDate) }}
									</div>
								</div>
								<div v-else class="text-sm opacity-50">
									Sin información de documento
								</div>
							</div>
						</div>

						<!-- Notes -->
						<div v-if="selectedCustomer.notes">
							<h5 class="text-sm font-medium mb-3">
								Notas
							</h5>
							<p class="text-sm opacity-75 border p-3 rounded-lg">
								{{ selectedCustomer.notes }}
							</p>
						</div>
					</div>

					<template #footer>
						<div class="flex justify-end gap-3">
							<UButton variant="outline" @click="closeViewModal">
								Cerrar
							</UButton>
							<UButton color="primary" @click="editCustomer(selectedCustomer!)">
								Editar Cliente
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>

		<!-- Delete Confirm Modal -->
		<UModal v-model:open="isDeleteModalOpen">
			<template #content>
				<UCard>
					<template #header>
						<h3 class="text-lg font-semibold">
							Confirmar Eliminación
						</h3>
					</template>
					<div class="space-y-4">
						<p>¿Estás seguro de que quieres eliminar este cliente?</p>
						<div v-if="customerToDelete" class="rounded-lg p-4 border">
							<h4 class="font-medium">
								{{ customerToDelete.name }}
							</h4>
							<p class="text-sm opacity-75">
								Esta acción no se puede deshacer.
							</p>
						</div>
					</div>
					<template #footer>
						<div class="flex gap-3 justify-end">
							<UButton variant="outline" @click="isDeleteModalOpen = false">
								Cancelar
							</UButton>
							<UButton color="error" :loading="loading" @click="confirmDeleteCustomer">
								Eliminar
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "~/schemas/customer";
	import { computed, onMounted, ref } from "vue";
	import { useCustomers } from "~/composables/useCustomers";
	import { CreateCustomerSchema, UpdateCustomerSchema } from "~/schemas/customer";

	// Composables
	const {
		customers,
		loading,
		error,
		activeCustomers,
		inactiveCustomers,
		totalCustomers,
		createCustomer,
		getCustomers,
		updateCustomer,
		deleteCustomer: deleteCustomerComposable,
		searchCustomers
	} = useCustomers();

	// State
	const searchQuery = ref("");
	const statusFilter = ref("all");
	const searchResults = ref<Customer[]>([]);
	const isModalOpen = ref(false);
	const isViewModalOpen = ref(false);
	const isDeleteModalOpen = ref(false);
	const isEditing = ref(false);
	const selectedCustomer = ref<Customer | null>(null);
	const customerToDelete = ref<Customer | null>(null);

	// Form state
	const formState = ref<CreateCustomerInput | UpdateCustomerInput>({
		name: "",
		email: "",
		phone: "",
		address: "",
		documentType: undefined,
		documentNumber: "",
		birthDate: "",
		notes: "",
		isActive: true,
		tenantId: "default"
	});

	// Options
	const statusOptions = [
		{ label: "Todos", value: "all" },
		{ label: "Activos", value: "active" },
		{ label: "Inactivos", value: "inactive" }
	];

	const documentTypeOptions = [
		{ label: "Cédula", value: "cedula" },
		{ label: "RIF", value: "rif" },
		{ label: "Pasaporte", value: "passport" }
	];

	// Schema for validation
	const customerSchema = isEditing.value ? UpdateCustomerSchema : CreateCustomerSchema;

	// Computed
	const displayedCustomers = computed<Customer[]>(() => {
		const coerce = (list: any[]): Customer[] =>
			list.map((c: any) => ({
				id: c.id,
				tenantId: c.tenantId ?? "default",
				name: c.name ?? "",
				isActive: Boolean(c.isActive ?? true),
				createdAt: (c.createdAt ?? new Date().toISOString()) as string,
				updatedAt: (c.updatedAt ?? new Date().toISOString()) as string,
				email: c.email ?? undefined,
				phone: c.phone ?? undefined,
				address: c.address ?? undefined,
				documentType: c.documentType ?? undefined,
				documentNumber: c.documentNumber ?? undefined,
				birthDate: c.birthDate ?? undefined,
				notes: c.notes ?? undefined
			}));

		if (searchQuery.value) return coerce(searchResults.value as any[]);
		if (statusFilter.value === "active") return coerce(activeCustomers.value as any[]);
		if (statusFilter.value === "inactive") return coerce(inactiveCustomers.value as any[]);
		return coerce(customers.value as any[]);
	});

	// Helpers
	const normalizeCustomers = (list: any[]): Customer[] =>
		(list || []).map((c: any) => ({
			id: c.id,
			tenantId: c.tenantId ?? "default",
			name: c.name ?? "",
			isActive: Boolean(c.isActive ?? true),
			createdAt: (c.createdAt ?? new Date().toISOString()) as string,
			updatedAt: (c.updatedAt ?? new Date().toISOString()) as string,
			email: c.email ?? undefined,
			phone: c.phone ?? undefined,
			address: c.address ?? undefined,
			documentType: c.documentType ?? undefined,
			documentNumber: c.documentNumber ?? undefined,
			birthDate: c.birthDate ?? undefined,
			notes: c.notes ?? undefined
		}));

	// Methods
	const loadCustomers = async () => {
		try {
			await getCustomers(false); // Load all customers (active and inactive)
		} catch (err) {
			console.error("Error loading customers:", err);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.value.trim()) {
			searchResults.value = [] as unknown as Customer[];
			return;
		}

		try {
			const raw = await searchCustomers(searchQuery.value, statusFilter.value !== "inactive");
			searchResults.value = normalizeCustomers(raw as any[]) as unknown as Customer[];
		} catch (err) {
			console.error("Error searching customers:", err);
		}
	};

	const handleFilter = () => {
		if (searchQuery.value) {
			handleSearch();
		}
	};

	const clearFilters = () => {
		searchQuery.value = "";
		statusFilter.value = "all";
		searchResults.value = [];
	};

	const openCreateModal = () => {
		isEditing.value = false;
		formState.value = {
			name: "",
			email: "",
			phone: "",
			address: "",
			documentType: undefined,
			documentNumber: "",
			birthDate: "",
			notes: "",
			isActive: true,
			tenantId: "default"
		};
		isModalOpen.value = true;
	};

	const editCustomer = (customer: Customer) => {
		isEditing.value = true;
		formState.value = {
			id: customer.id,
			name: customer.name,
			email: customer.email || "",
			phone: customer.phone || "",
			address: customer.address || "",
			documentType: customer.documentType || undefined,
			documentNumber: customer.documentNumber || "",
			birthDate: customer.birthDate || "",
			notes: customer.notes || "",
			isActive: customer.isActive
		};
		isModalOpen.value = true;
	};

	const viewCustomer = (customer: Customer) => {
		selectedCustomer.value = customer;
		isViewModalOpen.value = true;
	};

	const requestDeleteCustomer = (customer: Customer) => {
		customerToDelete.value = customer;
		isDeleteModalOpen.value = true;
	};

	const confirmDeleteCustomer = async () => {
		if (!customerToDelete.value) return;
		try {
			await deleteCustomerComposable(customerToDelete.value.id);
			await loadCustomers();
		} catch (err) {
			console.error("Error deleting customer:", err);
		} finally {
			isDeleteModalOpen.value = false;
			customerToDelete.value = null;
		}
	};

	const closeModal = () => {
		isModalOpen.value = false;
		formState.value = {
			name: "",
			email: "",
			phone: "",
			address: "",
			documentType: undefined,
			documentNumber: "",
			birthDate: "",
			notes: "",
			isActive: true,
			tenantId: "default"
		};
	};

	const handleSubmit = async () => {
		try {
			if (isEditing.value) {
				await updateCustomer((formState.value as UpdateCustomerInput).id!, formState.value as UpdateCustomerInput);
			} else {
				await createCustomer(formState.value as CreateCustomerInput);
			}

			closeModal();
			await loadCustomers();
		} catch (err) {
			console.error("Error saving customer:", err);
		}
	};

	const closeViewModal = () => {
		isViewModalOpen.value = false;
		selectedCustomer.value = null;
	};

	const getDocumentTypeLabel = (type: string) => {
		const option = documentTypeOptions.find((opt) => opt.value === type);
		return option ? option.label : type;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-VE", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	};

	// Lifecycle
	onMounted(() => {
		loadCustomers();
	});
</script>
