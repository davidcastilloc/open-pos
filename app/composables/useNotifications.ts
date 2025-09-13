import { ref } from "vue";

export interface Notification {
	id: string
	type: "success" | "error" | "warning" | "info"
	title: string
	description?: string
	duration?: number
	persistent?: boolean
}

// Estado global de notificaciones
const notifications = ref<Notification[]>([]);

export function useNotifications() {
	// Remover notificación
	const removeNotificationById = (id: string) => {
		const index = notifications.value.findIndex((n) => n.id === id);
		if (index > -1) {
			notifications.value.splice(index, 1);
		}
	};

	// Agregar notificación
	const addNotification = (notification: Omit<Notification, "id">) => {
		const id = crypto.randomUUID();
		const newNotification: Notification = {
			id,
			duration: 5000, // 5 segundos por defecto
			persistent: false,
			...notification
		};

		notifications.value.push(newNotification);

		// Auto-remover si no es persistente
		if (!newNotification.persistent && newNotification.duration) {
			setTimeout(() => {
				removeNotificationById(id);
			}, newNotification.duration);
		}

		return id;
	};

	// Limpiar todas las notificaciones
	const clearAll = () => {
		notifications.value = [];
	};

	// Métodos de conveniencia
	const success = (title: string, description?: string, options?: Partial<Notification>) => {
		return addNotification({
			type: "success",
			title,
			description,
			...options
		});
	};

	const error = (title: string, description?: string, options?: Partial<Notification>) => {
		return addNotification({
			type: "error",
			title,
			description,
			persistent: true, // Los errores son persistentes por defecto
			...options
		});
	};

	const warning = (title: string, description?: string, options?: Partial<Notification>) => {
		return addNotification({
			type: "warning",
			title,
			description,
			...options
		});
	};

	const info = (title: string, description?: string, options?: Partial<Notification>) => {
		return addNotification({
			type: "info",
			title,
			description,
			...options
		});
	};

	return {
		// Estado
		notifications: readonly(notifications),

		// Métodos
		addNotification,
		removeNotification: removeNotificationById,
		clearAll,

		// Métodos de conveniencia
		success,
		error,
		warning,
		info
	};
}
