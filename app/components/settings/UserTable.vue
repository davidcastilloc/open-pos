<template>
	<div>
		<UTable :rows="users" :columns="columns as any" :loading="loading">
			<template #username-data="{ row }">
				<span class="font-medium">{{ (row as any).username }}</span>
			</template>

			<template #email-data="{ row }">
				<span class="text-gray-500">{{ (row as any).email }}</span>
			</template>

			<template #role-data="{ row }">
				<UBadge
					:color="getRoleColor((row as any).role)"
					variant="subtle"
					:label="getRoleLabel((row as any).role)"
				/>
			</template>

			<template #actions-data="{ row }">
				<div class="flex gap-2">
					<UButton
						icon="i-heroicons-pencil-square"
						color="neutral"
						variant="ghost"
						@click="emit('edit', row as any)"
					/>
					<UButton
						icon="i-heroicons-trash"
						color="error"
						variant="ghost"
						@click="confirmDelete(row as any)"
					/>
				</div>
			</template>
		</UTable>

		<UModal v-model="showDeleteModal">
			<UCard>
				<template #header>
					<h3 class="text-lg font-semibold">
						Eliminar Usuario
					</h3>
				</template>

				<p>¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.username }}</strong>?</p>
				<p class="text-sm text-gray-500 mt-2">
					Esta acción no se puede deshacer.
				</p>

				<template #footer>
					<div class="flex gap-3 justify-end">
						<UButton color="neutral" variant="ghost" @click="showDeleteModal = false">
							Cancelar
						</UButton>
						<UButton color="error" :loading="deleting" @click="handleDelete">
							Eliminar
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import type { User } from "~/database/schema";
	import { useUser } from "~/composables/useUser";

	defineProps<{
		users: User[]
		loading?: boolean
	}>();

	const emit = defineEmits<{
		(e: "edit", user: User): void
		(e: "deleted", userId: string): void
	}>();

	const { deleteUser } = useUser();

	const columns = [
		{ key: "username", label: "Usuario" },
		{ key: "email", label: "Email" },
		{ key: "firstName", label: "Nombre" },
		{ key: "lastName", label: "Apellido" },
		{ key: "role", label: "Rol" },
		{ key: "actions", label: "Acciones" }
	];

	const showDeleteModal = ref(false);
	const userToDelete = ref<User | null>(null);
	const deleting = ref(false);

	function getRoleColor(role: string) {
		switch (role) {
		case "admin":
			return "error";
		case "manager":
			return "info";
		default:
			return "neutral";
		}
	}

	function getRoleLabel(role: string) {
		switch (role) {
		case "admin":
			return "Administrador";
		case "manager":
			return "Gerente";
		default:
			return "Cajero";
		}
	}

	function confirmDelete(user: User) {
		userToDelete.value = user;
		showDeleteModal.value = true;
	}

	async function handleDelete() {
		if (!userToDelete.value) return;

		deleting.value = true;
		try {
			await deleteUser(userToDelete.value.id);
			emit("deleted", userToDelete.value.id);
			showDeleteModal.value = false;
		} catch (error) {
			console.error("Error deleting user:", error);
		} finally {
			deleting.value = false;
		}
	}
</script>
