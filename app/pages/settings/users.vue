<template>
	<div class="space-y-6">
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-2xl font-bold">
					Gestión de Usuarios
				</h1>
				<p class="text-gray-500">
					Administra los usuarios y permisos del sistema
				</p>
			</div>
			<UButton
				icon="i-heroicons-plus"
				color="primary"
				@click="showForm = true; selectedUser = null"
			>
				Nuevo Usuario
			</UButton>
		</div>

		<UCard>
			<UserTable
				:users="users"
				:loading="loading"
				@edit="editUser"
				@deleted="onUserDeleted"
			/>
		</UCard>

		<UModal v-model="showForm">
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						{{ selectedUser ? 'Editar Usuario' : 'Crear Usuario' }}
					</h3>
				</template>

				<UserForm
					:model-value="selectedUser"
					@submit="onUserSaved"
					@cancel="showForm = false"
				/>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import type { User } from "~/database/schema";
	import { onMounted, ref } from "vue";
	import UserForm from "~/components/settings/UserForm.vue";
	import UserTable from "~/components/settings/UserTable.vue";
	import { useUser } from "~/composables/useUser";

	const { getAllUsers } = useUser();

	const users = ref<User[]>([]);
	const loading = ref(false);
	const showForm = ref(false);
	const selectedUser = ref<User | null>(null);

	onMounted(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		loading.value = true;
		try {
			users.value = await getAllUsers();
		} catch (error) {
			console.error("Error loading users:", error);
		} finally {
			loading.value = false;
		}
	}

	function editUser(user: User) {
		selectedUser.value = user;
		showForm.value = true;
	}

	async function onUserSaved() {
		showForm.value = false;
		await loadUsers();
	}

	async function onUserDeleted() {
		await loadUsers();
	}
</script>
