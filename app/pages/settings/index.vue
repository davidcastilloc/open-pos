<template>
	<div class="space-y-4">
		<h1 class="text-2xl font-bold mb-4">
			Configuración
		</h1>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<!-- Datos del Negocio -->
			<ULink to="/settings/business">
				<UCard class="hover:border-primary cursor-pointer">
					<div class="flex items-center gap-3">
						<span class="text-2xl">🏢</span>
						<div>
							<h3 class="font-semibold">
								Datos del Negocio
							</h3>
							<p class="text-sm text-gray-500">
								Nombre, dirección, RIF, teléfono
							</p>
						</div>
					</div>
				</UCard>
			</ULink>

			<!-- Gestión de Usuarios -->
			<ULink to="/settings/users">
				<UCard class="hover:border-primary cursor-pointer">
					<div class="flex items-center gap-3">
						<span class="text-2xl">👥</span>
						<div>
							<h3 class="font-semibold">
								Gestión de Usuarios
							</h3>
							<p class="text-sm text-gray-500">
								Administrar usuarios y permisos
							</p>
						</div>
					</div>
				</UCard>
			</ULink>
		</div>
	</div>
</template>

<script setup lang="ts">
</script>
