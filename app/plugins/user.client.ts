import { useUser } from "~/composables/useUser";

export default defineNuxtPlugin(async () => {
	const { initializeUser } = useUser();

	// Inicializar usuario al cargar la aplicación
	await initializeUser();
});
