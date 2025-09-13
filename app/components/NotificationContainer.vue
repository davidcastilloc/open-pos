<template>
	<Teleport to="body">
		<div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
			<TransitionGroup
				name="notification"
				tag="div"
				class="space-y-2"
			>
				<div
					v-for="notification in notifications"
					:key="notification.id"
					class="relative"
				>
					<UAlert
						:color="getAlertColor(notification.type)"
						:title="notification.title"
						:description="notification.description"
						:icon="getAlertIcon(notification.type)"
						class="shadow-lg"
					>
						<template #actions>
							<UButton
								icon="i-heroicons-x-mark"
								variant="ghost"
								color="neutral"
								size="xs"
								@click="removeNotification(notification.id)"
							/>
						</template>
					</UAlert>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { useNotifications } from "~/composables/useNotifications";

	const { notifications, removeNotification } = useNotifications();

	// Mapear tipos de notificación a colores de UAlert
	const getAlertColor = (type: string) => {
		switch (type) {
		case "success":
			return "success";
		case "error":
			return "error";
		case "warning":
			return "warning";
		case "info":
			return "info";
		default:
			return "neutral";
		}
	};

	// Mapear tipos de notificación a iconos
	const getAlertIcon = (type: string) => {
		switch (type) {
		case "success":
			return "i-heroicons-check-circle";
		case "error":
			return "i-heroicons-x-circle";
		case "warning":
			return "i-heroicons-exclamation-triangle";
		case "info":
			return "i-heroicons-information-circle";
		default:
			return "i-heroicons-bell";
		}
	};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
	transition: all 0.3s ease;
}

.notification-enter-from {
	opacity: 0;
	transform: translateX(100%);
}

.notification-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

.notification-move {
	transition: transform 0.3s ease;
}
</style>
