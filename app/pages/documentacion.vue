<template>
	<div class="max-w-5xl mx-auto p-6 space-y-8">
		<!-- Encabezado -->
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-bold">
					Documentación
				</h1>
				<p class="opacity-75 text-sm">
					Recursos y guías del proyecto
				</p>
			</div>
			<div class="flex gap-3">
				<UButton to="https://nuxt.com" target="_blank" rel="noopener">
					Nuxt
				</UButton>
				<UButton to="https://ui.nuxt.dev" target="_blank" rel="noopener">
					Nuxt UI
				</UButton>
				<UButton to="https://tauri.app" target="_blank" rel="noopener">
					Tauri
				</UButton>
			</div>
		</div>

		<!-- Estado de versión (useFetch cliente-only) -->
		<UCard>
			<template #header>
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold">
						Información de la versión
					</h2>
					<UButton size="sm" :loading="pending" @click="refresh">
						<UIcon name="i-heroicons-arrow-path" />
						Actualizar
					</UButton>
				</div>
			</template>

			<div v-if="error" class="text-error mb-2">
				Error cargando versión: {{ String(error) }}
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="rounded-lg border p-4">
					<div class="font-medium">
						App
					</div>
					<div class="opacity-75 text-sm">
						{{ config.public.appName }}
					</div>
				</div>
				<div class="rounded-lg border p-4">
					<div class="font-medium">
						Versión
					</div>
					<div class="opacity-75 text-sm">
						{{ version?.version ?? '—' }}
					</div>
				</div>
				<div class="rounded-lg border p-4">
					<div class="font-medium">
						Fecha
					</div>
					<div class="opacity-75 text-sm">
						{{ version?.date ?? '—' }}
					</div>
				</div>
			</div>
		</UCard>

		<!-- Enlaces útiles -->
		<UCard>
			<template #header>
				<h2 class="text-lg font-semibold">
					Recursos
				</h2>
			</template>
			<div class="space-y-3">
				<ULink to="https://github.com/davidcastilloc/open-pos" target="_blank" rel="noopener" class="flex items-center gap-2">
					<UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
					Repositorio del Proyecto
				</ULink>
				<ULink to="https://ui.nuxt.dev/components" target="_blank" rel="noopener" class="flex items-center gap-2">
					<UIcon name="i-heroicons-puzzle-piece" class="w-4 h-4" />
					Componentes de Nuxt UI
				</ULink>
				<ULink to="https://tauri.app/v2/api/js/" target="_blank" rel="noopener" class="flex items-center gap-2">
					<UIcon name="i-heroicons-command-line" class="w-4 h-4" />
					APIs Tauri JS
				</ULink>
			</div>
		</UCard>

		<!-- Botón que abre modal de guía -->
		<div class="flex justify-end">
			<UButton icon="i-heroicons-information-circle" @click="isGuideOpen = true">
				Ver guía rápida
			</UButton>
		</div>

		<!-- Modal con sintaxis correcta Nuxt UI v3 -->
		<UModal v-model:open="isGuideOpen">
			<template #content>
				<UCard>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">
								Guía rápida
							</h3>
							<UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" @click="isGuideOpen = false" />
						</div>
					</template>

					<div class="space-y-4 text-sm">
						<div class="rounded-lg border p-4">
							<div class="font-medium mb-1">
								Reglas de colores
							</div>
							<ul class="list-disc pl-5 space-y-1">
								<li>Evita colores explícitos en clases (`text-*`, `bg-*`).</li>
								<li>Usa colores semánticos solo en componentes UI.</li>
								<li>Prefiere opacidades para jerarquía de texto.</li>
							</ul>
						</div>
						<div class="rounded-lg border p-4">
							<div class="font-medium mb-1">
								Modales Nuxt UI v3
							</div>
							<ul class="list-disc pl-5 space-y-1">
								<li>Usa <code>v-model:open</code> para visibilidad.</li>
								<li>Siempre envuelve con <code>&lt;template #content&gt;</code>.</li>
								<li>Coloca <code>#header</code> y <code>#footer</code> en <code>UCard</code>.</li>
							</ul>
						</div>
					</div>

					<template #footer>
						<div class="flex justify-end gap-3">
							<UButton variant="outline" @click="isGuideOpen = false">
								Cerrar
							</UButton>
						</div>
					</template>
				</UCard>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	const config = useRuntimeConfig();
	const isGuideOpen = ref(false);

	interface VersionInfo {
		version: string
		date?: string
	}

	const { data: version, pending, error, refresh } = useFetch<VersionInfo>(
		"/version.json",
		{ server: false, immediate: true }
	);

	useHead({
		title: `Documentación · ${config.public.appName}`,
		meta: [
			{ name: "description", content: "Recursos y guía del sistema POS" }
		]
	});
</script>
