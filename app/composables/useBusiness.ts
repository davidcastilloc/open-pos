import { computed, readonly, ref } from "vue";
import { z } from "zod";
import { useConfig } from "./useConfig";

// Schema de datos del negocio
export const BusinessSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	address: z.string().optional(),
	rif: z.string().optional(),
	phone: z.string().optional(),
	logoPath: z.string().optional()
});

export type BusinessData = z.infer<typeof BusinessSchema>;

// Schema para validación de RIF venezolano
export const rifPattern = /^[JVE]-\d{8}$/i;

export function validateRIF(rif: string): boolean {
	return rifPattern.test(rif);
}

export function useBusiness() {
	const { getConfig, updateConfig, loadConfig } = useConfig();
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Cargar configuración del negocio
	const loadBusiness = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			// Cargar desde categoría "business" de useConfig
			await loadConfig("business");
		} catch (err) {
			error.value = "Error al cargar datos del negocio";
			console.error("Error loading business config:", err);
		} finally {
			isLoading.value = false;
		}
	};

	// Obtener datos del negocio
	const businessData = computed<BusinessData>(() => {
		return getConfig("business", "data") || {
			name: "Mi Negocio",
			address: "",
			rif: "",
			phone: "",
			logoPath: ""
		};
	});

	// Actualizar datos del negocio
	const updateBusiness = async (data: Partial<BusinessData>) => {
		try {
			// Validar RIF si se proporciona
			if (data.rif && !validateRIF(data.rif)) {
				throw new Error("RIF inválido. Formato esperado: J-12345678");
			}

			const currentData = businessData.value;
			const newData = { ...currentData, ...data };

			// Validar con Zod
			BusinessSchema.parse(newData);

			// Guardar en configuración
			await updateConfig("business", "data", newData);
			console.log("Business data updated:", newData);
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Error al actualizar datos";
			console.error("Error updating business data:", err);
			throw err;
		}
	};

	// Validar RIF con feedback
	const validateRIFWithFeedback = (rif: string): { valid: boolean, message: string } => {
		if (!rif) {
			return { valid: false, message: "RIF es requerido" };
		}

		if (!validateRIF(rif)) {
			return { valid: false, message: "RIF inválido. Formato: J-12345678" };
		}

		return { valid: true, message: "RIF válido" };
	};

	// Resetear a valores por defecto
	const resetToDefault = async () => {
		const defaultData: BusinessData = {
			name: "Mi Negocio",
			address: "",
			rif: "",
			phone: "",
			logoPath: ""
		};

		await updateBusiness(defaultData);
	};

	return {
		// Estado
		businessData: readonly(businessData),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Métodos
		loadBusiness,
		updateBusiness,
		validateRIFWithFeedback,
		resetToDefault,
		validateRIF
	};
}
