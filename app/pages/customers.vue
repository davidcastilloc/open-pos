<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<div class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center py-6">
					<div>
						<h1 class="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
						<p class="mt-1 text-sm text-gray-500">
							Administra la información de tus clientes
						</p>
					</div>
					<UButton
						@click="openCreateModal"
						icon="i-heroicons-plus"
						color="primary"
						size="lg"
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
							<UIcon name="i-heroicons-users" class="h-8 w-8 text-blue-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Total Clientes</p>
							<p class="text-2xl font-semibold text-gray-900">{{ totalCustomers }}</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-user-check" class="h-8 w-8 text-green-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Clientes Activos</p>
							<p class="text-2xl font-semibold text-gray-900">{{ activeCustomers.length }}</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-user-minus" class="h-8 w-8 text-gray-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Clientes Inactivos</p>
							<p class="text-2xl font-semibold text-gray-900">{{ inactiveCustomers.length }}</p>
						</div>
					</div>
				</UCard>

				<UCard>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-purple-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Búsquedas</p>
							<p class="text-2xl font-semibold text-gray-900">{{ searchResults.length }}</p>
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
							@click="clearFilters"
							variant="outline"
							icon="i-heroicons-x-mark"
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
					<p class="text-red-600">{{ error }}</p>
					<UButton @click="loadCustomers" class="mt-4" color="red" variant="outline">
						Reintentar
					</UButton>
				</div>

				<div v-else-if="displayedCustomers.length === 0" class="text-center py-8">
					<UIcon name="i-heroicons-users" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-500">No se encontraron clientes</p>
					<UButton @click="openCreateModal" class="mt-4" color="primary">
						Crear Primer Cliente
					</UButton>
				</div>

				<div v-else>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Cliente
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Contacto
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Documento
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Estado
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Fecha de Registro
									</th>
									<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<tr v-for="customer in displayedCustomers" :key="customer.id" class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<div class="flex-shrink-0 h-10 w-10">
												<div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
													<UIcon name="i-heroicons-user" class="h-6 w-6 text-blue-600" />
												</div>
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">
													{{ customer.name }}
												</div>
												<div v-if="customer.notes" class="text-sm text-gray-500 truncate max-w-xs">
													{{ customer.notes }}
												</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm text-gray-900">
											<div v-if="customer.email" class="flex items-center">
												<UIcon name="i-heroicons-envelope" class="h-4 w-4 text-gray-400 mr-2" />
												{{ customer.email }}
											</div>
											<div v-if="customer.phone" class="flex items-center mt-1">
												<UIcon name="i-heroicons-phone" class="h-4 w-4 text-gray-400 mr-2" />
												{{ customer.phone }}
											</div>
											<div v-if="customer.address" class="flex items-center mt-1">
												<UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400 mr-2" />
												<span class="truncate max-w-xs">{{ customer.address }}</span>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div v-if="customer.documentType && customer.documentNumber" class="text-sm text-gray-900">
											<div class="font-medium">{{ getDocumentTypeLabel(customer.documentType) }}</div>
											<div class="text-gray-500">{{ customer.documentNumber }}</div>
										</div>
										<div v-else class="text-sm text-gray-400">
											Sin documento
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<UBadge
											:color="customer.isActive ? 'green' : 'gray'"
											variant="subtle"
										>
											{{ customer.isActive ? 'Activo' : 'Inactivo' }}
										</UBadge>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{{ formatDate(customer.createdAt) }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div class="flex justify-end gap-2">
											<UButton
												@click="viewCustomer(customer)"
												icon="i-heroicons-eye"
												size="sm"
												variant="ghost"
												color="blue"
											>
												Ver
											</UButton>
											<UButton
												@click="editCustomer(customer)"
												icon="i-heroicons-pencil"
												size="sm"
												variant="ghost"
												color="yellow"
											>
												Editar
											</UButton>
											<UButton
												@click="deleteCustomer(customer)"
												icon="i-heroicons-trash"
												size="sm"
												variant="ghost"
												color="red"
											>
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
		<UModal v-model="isModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">
							{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
						</h3>
						<UButton
							@click="closeModal"
							icon="i-heroicons-x-mark"
							variant="ghost"
							color="gray"
						/>
					</div>
				</template>

				<UForm
					:schema="customerSchema"
					:state="formState"
					@submit="handleSubmit"
					class="space-y-4"
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
						<span class="ml-2 text-sm text-gray-500">
							{{ formState.isActive ? 'Cliente activo' : 'Cliente inactivo' }}
						</span>
					</UFormGroup>

					<template #footer>
						<div class="flex justify-end gap-3">
							<UButton @click="closeModal" variant="outline">
								Cancelar
							</UButton>
							<UButton type="submit" :loading="loading" color="primary">
								{{ isEditing ? 'Actualizar' : 'Crear' }} Cliente
							</UButton>
						</div>
					</template>
				</UForm>
			</UCard>
		</UModal>

		<!-- View Modal -->
		<UModal v-model="isViewModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Detalles del Cliente</h3>
						<UButton
							@click="closeViewModal"
							icon="i-heroicons-x-mark"
							variant="ghost"
							color="gray"
						/>
					</div>
				</template>

				<div v-if="selectedCustomer" class="space-y-6">
					<!-- Basic Info -->
					<div class="flex items-start space-x-4">
						<div class="flex-shrink-0">
							<div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
								<UIcon name="i-heroicons-user" class="h-8 w-8 text-blue-600" />
							</div>
						</div>
						<div class="flex-1">
							<h4 class="text-xl font-semibold text-gray-900">{{ selectedCustomer.name }}</h4>
							<p class="text-sm text-gray-500">
								Registrado el {{ formatDate(selectedCustomer.createdAt) }}
							</p>
							<UBadge
								:color="selectedCustomer.isActive ? 'green' : 'gray'"
								variant="subtle"
								class="mt-2"
							>
								{{ selectedCustomer.isActive ? 'Activo' : 'Inactivo' }}
							</UBadge>
						</div>
					</div>

					<!-- Contact Info -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h5 class="text-sm font-medium text-gray-900 mb-3">Información de Contacto</h5>
							<div class="space-y-2">
								<div v-if="selectedCustomer.email" class="flex items-center">
									<UIcon name="i-heroicons-envelope" class="h-4 w-4 text-gray-400 mr-2" />
									<span class="text-sm text-gray-600">{{ selectedCustomer.email }}</span>
								</div>
								<div v-if="selectedCustomer.phone" class="flex items-center">
									<UIcon name="i-heroicons-phone" class="h-4 w-4 text-gray-400 mr-2" />
									<span class="text-sm text-gray-600">{{ selectedCustomer.phone }}</span>
								</div>
								<div v-if="selectedCustomer.address" class="flex items-center">
									<UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400 mr-2" />
									<span class="text-sm text-gray-600">{{ selectedCustomer.address }}</span>
								</div>
							</div>
						</div>

						<div>
							<h5 class="text-sm font-medium text-gray-900 mb-3">Documento</h5>
							<div v-if="selectedCustomer.documentType && selectedCustomer.documentNumber" class="space-y-2">
								<div class="text-sm text-gray-600">
									<span class="font-medium">{{ getDocumentTypeLabel(selectedCustomer.documentType) }}:</span>
									{{ selectedCustomer.documentNumber }}
								</div>
								<div v-if="selectedCustomer.birthDate" class="text-sm text-gray-600">
									<span class="font-medium">Fecha de Nacimiento:</span>
									{{ formatDate(selectedCustomer.birthDate) }}
								</div>
							</div>
							<div v-else class="text-sm text-gray-400">
								Sin información de documento
							</div>
						</div>
					</div>

					<!-- Notes -->
					<div v-if="selectedCustomer.notes">
						<h5 class="text-sm font-medium text-gray-900 mb-3">Notas</h5>
						<p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
							{{ selectedCustomer.notes }}
						</p>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-3">
						<UButton @click="closeViewModal" variant="outline">
							Cerrar
						</UButton>
						<UButton @click="editCustomer(selectedCustomer)" color="primary">
							Editar Cliente
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCustomers } from "~/composables/useCustomers";
import { CreateCustomerSchema, UpdateCustomerSchema } from "~/schemas/customer";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "~/schemas/customer";

// Meta
useHead({
	title: "Gestión de Clientes - POS Venezuela"
});

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
const isEditing = ref(false);
const selectedCustomer = ref<Customer | null>(null);

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
	isActive: true
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
const displayedCustomers = computed(() => {
	if (searchQuery.value) {
		return searchResults.value;
	}
	
	if (statusFilter.value === "active") {
		return activeCustomers.value;
	} else if (statusFilter.value === "inactive") {
		return inactiveCustomers.value;
	}
	
	return customers.value;
});

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
		searchResults.value = [];
		return;
	}

	try {
		searchResults.value = await searchCustomers(searchQuery.value, statusFilter.value !== "inactive");
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
		isActive: true
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

const deleteCustomer = async (customer: Customer) => {
	if (confirm(`¿Estás seguro de que quieres eliminar al cliente "${customer.name}"?`)) {
		try {
			await deleteCustomerComposable(customer.id);
			await loadCustomers();
		} catch (err) {
			console.error("Error deleting customer:", err);
		}
	}
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
		isActive: true
	};
};

const closeViewModal = () => {
	isViewModalOpen.value = false;
	selectedCustomer.value = null;
};

const getDocumentTypeLabel = (type: string) => {
	const option = documentTypeOptions.find(opt => opt.value === type);
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
