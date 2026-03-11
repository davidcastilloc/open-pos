<template>
	<UForm :schema="schema" :state="state" class="space-y-4" @submit.prevent="handleSubmit">
		<UFormGroup label="Nombre de usuario" name="username" required>
			<UInput
				v-model="state.username"
				placeholder="Ej: juan.perez"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<UFormGroup label="Email" name="email" required>
			<UInput
				v-model="state.email"
				type="email"
				placeholder="juan@pos.local"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<div class="grid grid-cols-2 gap-4">
			<UFormGroup label="Nombre" name="firstName" required>
				<UInput
					v-model="state.firstName"
					placeholder="Juan"
					:disabled="isLoading"
				/>
			</UFormGroup>

			<UFormGroup label="Apellido" name="lastName" required>
				<UInput
					v-model="state.lastName"
					placeholder="Pérez"
					:disabled="isLoading"
				/>
			</UFormGroup>
		</div>

		<UFormGroup label="Rol" name="role" required>
			<USelect
				v-model="state.role"
				:options="roleOptions"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<UFormGroup v-if="!isEditMode" label="Contraseña" name="password" required>
			<UInput
				v-model="state.password"
				type="password"
				placeholder="Mínimo 6 caracteres"
				:disabled="isLoading"
			/>
		</UFormGroup>

		<div class="flex gap-3 pt-4">
			<UButton
				type="submit"
				color="primary"
				:disabled="!isValid() || isLoading"
				:loading="isLoading"
			>
				{{ isEditMode ? 'Actualizar' : 'Crear' }} Usuario
			</UButton>
			<UButton type="button" variant="outline" @click="resetForm">
				Cancelar
			</UButton>
		</div>

		<UAlert
			v-if="error"
			color="error"
			icon="i-heroicons-exclamation-circle"
			title="Error"
			:description="error"
		/>
	</UForm>
</template>

<script setup lang="ts">
	import type { User } from "~/database/schema";
	import { computed, ref, watch } from "vue";
	import { z } from "zod";
	import { useUser } from "~/composables/useUser";

	const props = defineProps<{
		modelValue?: User | null
	}>();

	const emit = defineEmits<{
		(e: "update:modelValue", value: User | null): void
		(e: "submit", value: User): void
		(e: "cancel"): void
	}>();

	const { createUser, updateUser, canCreateAdmin, currentUser } = useUser();

	const schema = z.object({
		username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
		email: z.string().email("Email inválido"),
		firstName: z.string().min(1, "El nombre es requerido"),
		lastName: z.string().min(1, "El apellido es requerido"),
		role: z.enum(["admin", "manager", "cashier"]),
		password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional()
	});

	const state = ref({
		username: "",
		email: "",
		firstName: "",
		lastName: "",
		role: "cashier" as "admin" | "manager" | "cashier",
		password: ""
	});

	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const isEditMode = computed(() => !!props.modelValue?.id);

	const roleOptions = computed(() => {
		const options = [
			{ label: "Cajero", value: "cashier" },
			{ label: "Gerente", value: "manager" }
		];
		if (canCreateAdmin.value || currentUser.value?.role === "admin") {
			options.unshift({ label: "Administrador", value: "admin" });
		}
		return options;
	});

	watch(() => props.modelValue, (newUser) => {
		if (newUser) {
			state.value = {
				username: newUser.username,
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				role: newUser.role,
				password: ""
			};
		} else {
			resetForm();
		}
	}, { immediate: true });

	function resetForm() {
		state.value = {
			username: "",
			email: "",
			firstName: "",
			lastName: "",
			role: "cashier",
			password: ""
		};
		emit("cancel");
	}

	function isValid() {
		try {
			schema.parse(state.value);
			return true;
		} catch {
			return false;
		}
	}

	async function handleSubmit() {
		if (!isValid()) return;

		isLoading.value = true;
		error.value = null;

		try {
			if (isEditMode.value && props.modelValue) {
				await updateUser(props.modelValue.id, {
					username: state.value.username,
					email: state.value.email,
					firstName: state.value.firstName,
					lastName: state.value.lastName,
					role: state.value.role
				});
				emit("submit", props.modelValue);
			} else {
				const userId = await createUser({
					username: state.value.username,
					email: state.value.email,
					firstName: state.value.firstName,
					lastName: state.value.lastName,
					role: state.value.role,
					isActive: true,
					passwordHash: `hashed_${state.value.password}`
				});
				const newUser: User = {
					id: userId,
					username: state.value.username,
					email: state.value.email,
					firstName: state.value.firstName,
					lastName: state.value.lastName,
					role: state.value.role,
					isActive: true,
					passwordHash: `hashed_${state.value.password}`,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				emit("submit", newUser);
			}
			resetForm();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error desconocido";
		} finally {
			isLoading.value = false;
		}
	}
</script>
