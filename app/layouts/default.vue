<template>
	<div class="min-h-screen flex flex-col">
		<SiteNavbar class="sticky bg-(--ui-bg)/75 backdrop-blur" />
		<SiteSidebar />

		<div class="flex-1">
			<UContainer class="h-full">
				<slot />
			</UContainer>
		</div>

		<!-- Contenedor de notificaciones -->
		<NotificationContainer />
	</div>
</template>
