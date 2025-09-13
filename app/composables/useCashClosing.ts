import type { CashClosingDBData } from "~/composables/useCashClosingDB";
import { computed, readonly, ref } from "vue";
import { useAccounts } from "~/composables/useAccounts";
import { useCashClosingDB } from "~/composables/useCashClosingDB";
import { getPaymentMethodLabel } from "~/composables/usePaymentMethods";
import { useTransactions } from "~/composables/useTransactions";
import { useUser } from "~/composables/useUser";

export interface CashClosingData {
	id?: number
	cashierId: string
	cashierName: string
	startTime: Date
	endTime: Date
	initialBalances: Record<string, number>
	finalBalances: Record<string, number>
	salesSummary: {
		totalTransactions: number
		totalAmount: Record<string, number>
		paymentMethods: Record<string, number>
	}
	observations?: string
	createdAt: Date
}

export interface ShiftSummary {
	currency: string
	total: number
	count: number
}

export interface PaymentMethodSummary {
	method: string
	amount: number
	count: number
}

// Estado global compartido para evitar múltiples instancias
const globalState = {
	isProcessing: ref(false),
	isGeneratingReport: ref(false),
	currentShift: ref<CashClosingData | null>(null),
	currentSession: ref<any>(null),
	shiftStartTime: ref<Date | null>(null),
	isCashSessionOpen: ref(false)
};

export function useCashClosing() {
	const { getTotalBalanceByCurrency } = useAccounts();
	const transactions = useTransactions();
	const cashClosingDB = useCashClosingDB();
	const { getCashierInfo } = useUser();

	// Usar estado global compartido
	const isProcessing = globalState.isProcessing;
	const isGeneratingReport = globalState.isGeneratingReport;
	const currentShift = globalState.currentShift;
	const currentSession = globalState.currentSession;
	const shiftStartTime = globalState.shiftStartTime;
	const isCashSessionOpen = globalState.isCashSessionOpen;

	// Función auxiliar para calcular duración del turno
	const getShiftDuration = (): string => {
		if (!shiftStartTime.value) return "00:00:00";

		const now = new Date();
		const diff = now.getTime() - shiftStartTime.value.getTime();

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	// Computed
	const accountBalances = computed(() => {
		try {
			return getTotalBalanceByCurrency.value || {};
		} catch (error) {
			console.error("Error getting account balances:", error);
			return {};
		}
	});

	const todayTransactions = ref<any[]>([]);

	const refreshTodayTransactions = async () => {
		try {
			const cashierId = currentSession.value?.cashierId as string | undefined;
			const result = await transactions.listTodaySales(cashierId ? { cashierId } : undefined);
			// Normalizar a arreglo por compatibilidad (query puede retornar { rows })
			const normalized = Array.isArray((result as any)?.rows)
				? (result as any).rows
				: (Array.isArray(result) ? (result as any) : []);
			todayTransactions.value = normalized;
		} catch (error) {
			console.error("Error getting today transactions:", error);
			todayTransactions.value = [];
		}
	};

	// Métodos
	const startShift = async (cashierId: string, cashierName: string) => {
		try {
			const startTime = new Date();
			shiftStartTime.value = startTime;

			const initialBalances = { ...accountBalances.value };

			const shiftData: Omit<CashClosingData, "id"> = {
				cashierId,
				cashierName,
				startTime,
				endTime: startTime, // Se actualizará al cerrar
				initialBalances,
				finalBalances: initialBalances,
				salesSummary: {
					totalTransactions: 0,
					totalAmount: {},
					paymentMethods: {}
				},
				createdAt: startTime
			};

			// Guardar en base de datos
			await cashClosingDB.createCashSession({
				cashierId: getCashierInfo.value.cashierId,
				cashierName: getCashierInfo.value.cashierName,
				startTime: startTime.toISOString(),
				initialBalances: JSON.stringify({}),
				status: "open"
			});

			console.log("Turno iniciado:", shiftData);

			return shiftData;
		} catch (error) {
			console.error("Error starting shift:", error);
			throw error;
		}
	};

	const getSalesSummary = (): Record<string, ShiftSummary> => {
		const summary: Record<string, ShiftSummary> = {};

		// Agrupar transacciones por moneda
		const txs: any[] = todayTransactions.value || [];
		txs.forEach((transaction: any) => {
			const currency = transaction.currency || "BS";

			if (!summary[currency]) {
				summary[currency] = {
					currency,
					total: 0,
					count: 0
				};
			}

			// Campos de transacción esperados: amount (no total), currency
			summary[currency].total += transaction.amount || 0;
			summary[currency].count += 1;
		});

		return summary;
	};

	const getPaymentMethodsSummary = (): Record<string, PaymentMethodSummary> => {
		const summary: Record<string, PaymentMethodSummary> = {};

		// Agrupar por método de pago (usamos reference o description si existiera un campo directo más adelante)
		const txs: any[] = todayTransactions.value || [];
		txs.forEach((transaction: any) => {
			const method = transaction.payment_method || transaction.paymentMethod || "cash";

			if (!summary[method]) {
				summary[method] = {
					method,
					amount: 0,
					count: 0
				};
			}

			summary[method].amount += transaction.amount || 0;
			summary[method].count += 1;
		});

		return summary;
	};

	const generateCashClosingReport = async (observations?: string): Promise<CashClosingData> => {
		try {
			isProcessing.value = true;

			const endTime = new Date();
			const finalBalances = { ...accountBalances.value };
			const salesSummary = getSalesSummary();
			const paymentMethods = getPaymentMethodsSummary();

			// Calcular totales por moneda
			const totalAmount: Record<string, number> = {};
			Object.values(salesSummary).forEach((summary) => {
				totalAmount[summary.currency] = summary.total;
			});

			// Calcular totales por método de pago
			const paymentMethodsAmount: Record<string, number> = {};
			Object.values(paymentMethods).forEach((method) => {
				paymentMethodsAmount[method.method] = method.amount;
			});

			const cashClosingData: CashClosingData = {
				cashierId: getCashierInfo.value.cashierId,
				cashierName: getCashierInfo.value.cashierName,
				startTime: shiftStartTime.value || new Date(),
				endTime,
				initialBalances: currentShift.value?.initialBalances || {},
				finalBalances,
				salesSummary: {
					totalTransactions: todayTransactions.value.length,
					totalAmount,
					paymentMethods: paymentMethodsAmount
				},
				observations,
				createdAt: new Date()
			};

			// Calcular duración del turno
			const shiftDuration = getShiftDuration();

			// Guardar en base de datos
			await cashClosingDB.createCashClosing({
				sessionId: currentSession.value?.id || "temp-session",
				cashierId: getCashierInfo.value.cashierId,
				cashierName: getCashierInfo.value.cashierName,
				startTime: cashClosingData.startTime.toISOString(),
				endTime: cashClosingData.endTime.toISOString(),
				shiftDuration,
				initialBalances: JSON.stringify(cashClosingData.initialBalances),
				finalBalances: JSON.stringify(cashClosingData.finalBalances),
				balanceDifferences: JSON.stringify({}),
				totalTransactions: cashClosingData.salesSummary.totalTransactions,
				salesByCurrency: JSON.stringify(cashClosingData.salesSummary.totalAmount),
				salesByPaymentMethod: JSON.stringify(cashClosingData.salesSummary.paymentMethods),
				totalSalesAmount: Object.values(cashClosingData.salesSummary.totalAmount).reduce((sum, amount) => sum + amount, 0),
				expenses: JSON.stringify({}),
				adjustments: JSON.stringify({}),
				observations: cashClosingData.observations || "",
				status: "closed"
			});

			console.log("Reporte de cierre generado:", cashClosingData);

			return cashClosingData;
		} catch (error) {
			console.error("Error generating cash closing report:", error);
			throw error;
		} finally {
			isProcessing.value = false;
		}
	};

	const processCashClosing = async (observations?: string): Promise<boolean> => {
		try {
			isProcessing.value = true;

			// Validar que hay una sesión abierta
			if (!isCashSessionOpen.value || !currentSession.value) {
				throw new Error("No hay una sesión de caja abierta para cerrar");
			}

			// Validar que la sesión tenga los campos requeridos
			if (!currentSession.value.id) {
				throw new Error("ID de sesión no válido");
			}
			if (!currentSession.value.startTime) {
				// Intentar recargar la sesión desde la base de datos
				console.log("⚠️ startTime no definido, intentando recargar sesión...");
				await initializeCashSession();

				if (!currentSession.value || !currentSession.value.startTime) {
					// Fallback: usar fecha actual como inicio de sesión
					console.log("⚠️ Usando fecha actual como fallback para startTime");
					const fallbackStartTime = new Date().toISOString();
					currentSession.value = {
						...currentSession.value,
						startTime: fallbackStartTime
					};
				}
			}

			// Generar datos del cierre
			const endTime = new Date();

			// Debug: Verificar startTime
			console.log("currentSession.value.startTime:", currentSession.value.startTime);
			console.log("Tipo de startTime:", typeof currentSession.value.startTime);

			// Función para parsear fecha de manera segura
			const parseDate = (dateValue: any): Date => {
				if (dateValue instanceof Date) {
					return dateValue;
				}
				if (typeof dateValue === "string" && dateValue.trim() !== "") {
					const parsed = new Date(dateValue);
					if (Number.isNaN(parsed.getTime())) {
						throw new TypeError(`Fecha inválida: ${dateValue}`);
					}
					return parsed;
				}
				if (dateValue === null || dateValue === undefined) {
					throw new Error(`Fecha no definida: ${dateValue}`);
				}
				throw new Error(`Tipo de fecha no soportado: ${typeof dateValue}`);
			};

			const startTime = parseDate(currentSession.value.startTime);

			// Validar que las fechas sean válidas
			if (Number.isNaN(startTime.getTime())) {
				throw new TypeError(`Fecha de inicio inválida: ${currentSession.value.startTime}`);
			}
			if (Number.isNaN(endTime.getTime())) {
				throw new TypeError("Fecha de fin inválida");
			}

			console.log("startTime válida:", startTime.toISOString());
			console.log("endTime válida:", endTime.toISOString());

			const salesSummary = getSalesSummary();
			const paymentMethods = getPaymentMethodsSummary();

			// Calcular duración del turno
			const duration = endTime.getTime() - startTime.getTime();
			const hours = Math.floor(duration / (1000 * 60 * 60));
			const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((duration % (1000 * 60)) / 1000);
			const shiftDuration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

			// Preparar datos para la base de datos
			const salesSummaryData = salesSummary;
			const paymentMethodsData = paymentMethods;

			const closingData: CashClosingDBData = {
				sessionId: currentSession.value.id,
				cashierId: currentSession.value.cashierId || "admin",
				cashierName: currentSession.value.cashierName || "Administrador",
				startTime,
				endTime,
				shiftDuration,
				initialBalances: cashClosingDB.parseJsonField(currentSession.value.initialBalances, {}),
				finalBalances: accountBalances.value,
				balanceDifferences: calculateBalanceDifferences(
					cashClosingDB.parseJsonField(currentSession.value.initialBalances, {}),
					accountBalances.value
				),
				totalTransactions: todayTransactions.value.length,
				salesByCurrency: Object.fromEntries(
					Object.entries(salesSummaryData).map(([currency, data]) => [currency, data.total])
				),
				salesByPaymentMethod: Object.fromEntries(
					Object.values(paymentMethodsData).map((method) => [method.method, method.amount])
				),
				totalSalesAmount: Object.values(salesSummaryData).reduce((sum, data) => sum + data.total, 0),
				observations
			};

			// Guardar cierre en base de datos
			const savedClosing = await cashClosingDB.createCashClosing(closingData);

			console.log("✅ Cierre de caja guardado en base de datos:", savedClosing);

			// Cerrar sesión de caja
			await closeCashSession();

			console.log("✅ Cierre de caja procesado exitosamente");

			return true;
		} catch (error) {
			console.error("Error processing cash closing:", error);
			throw error;
		} finally {
			isProcessing.value = false;
		}
	};

	const formatShiftTime = (date: Date): string => {
		return date.toLocaleTimeString("es-VE", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		});
	};

	const formatShiftDate = (date: Date): string => {
		return date.toLocaleDateString("es-VE", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	};

	function calculateBalanceDifferences(
		initial: Record<string, number>,
		final: Record<string, number>
	): Record<string, number> {
		const differences: Record<string, number> = {};
		const allCurrencies = new Set([...Object.keys(initial), ...Object.keys(final)]);

		for (const currency of allCurrencies) {
			const initialAmount = initial[currency] || 0;
			const finalAmount = final[currency] || 0;
			differences[currency] = finalAmount - initialAmount;
		}

		return differences;
	}

	async function initializeCashSession(): Promise<void> {
		try {
			const activeSession = await cashClosingDB.getActiveCashSession();
			if (activeSession) {
				// Mapear campos de snake_case a camelCase
				const validatedSession = {
					id: activeSession.id,
					tenantId: activeSession.tenant_id,
					cashierId: activeSession.cashier_id || "admin",
					cashierName: activeSession.cashier_name || "Administrador",
					startTime: activeSession.start_time,
					endTime: activeSession.end_time,
					initialBalances: activeSession.initial_balances,
					status: activeSession.status,
					createdAt: activeSession.created_at,
					updatedAt: activeSession.updated_at
				};

				// Validar que startTime esté definido
				if (!validatedSession.startTime) {
					console.error("❌ Sesión sin startTime:", validatedSession);
					isCashSessionOpen.value = false;
					return;
				}

				currentSession.value = validatedSession;
				shiftStartTime.value = new Date(validatedSession.startTime);
				isCashSessionOpen.value = true;
				console.log("Sesión de caja activa encontrada:", validatedSession);
				await refreshTodayTransactions();
			} else {
				isCashSessionOpen.value = false;
				console.log("No hay sesión de caja activa");
			}
		} catch (error) {
			console.error("Error initializing cash session:", error);
			isCashSessionOpen.value = false;
		}
	}

	async function closeCashSession(): Promise<void> {
		try {
			if (!currentSession.value) {
				console.warn("No hay sesión activa para cerrar");
				return;
			}

			// Cerrar sesión en base de datos
			const success = await cashClosingDB.closeCashSession(currentSession.value.id);

			if (success) {
				// Actualizar estado local
				isCashSessionOpen.value = false;
				shiftStartTime.value = null;
				currentShift.value = null;
				currentSession.value = null;

				console.log("✅ Sesión de caja cerrada exitosamente");
			} else {
				throw new Error("No se pudo cerrar la sesión en la base de datos");
			}
		} catch (error) {
			console.error("Error closing cash session:", error);
			throw error;
		}
	}

	const generateReport = async (): Promise<string> => {
		try {
			isGeneratingReport.value = true;

			// Validar que hay una sesión abierta
			if (!isCashSessionOpen.value || !currentSession.value) {
				throw new Error("No hay una sesión de caja abierta para generar el reporte");
			}

			// Validar que los campos requeridos estén definidos
			if (!currentSession.value.id) {
				throw new Error("ID de sesión no válido");
			}

			const report = await generateCashClosingReport();

			// Generar reporte en formato texto
			const reportContent = `
REPORTE DE CIERRE DE CAJA
=========================

Información del Turno:
- Cajero: ${report.cashierName}
- Fecha: ${formatShiftDate(report.endTime)}
- Inicio: ${formatShiftTime(report.startTime)}
- Fin: ${formatShiftTime(report.endTime)}

Resumen de Ventas:
- Total de transacciones: ${report.salesSummary.totalTransactions}
${Object.entries(report.salesSummary.totalAmount).map(([currency, amount]) =>
	`- Total en ${currency}: ${amount.toLocaleString("es-VE")}`
).join("\n")}

Métodos de Pago:
${Object.entries(report.salesSummary.paymentMethods).map(([method, amount]) =>
	`- ${getPaymentMethodLabel(method)}: ${amount.toLocaleString("es-VE")}`
).join("\n")}

Saldos Finales:
${Object.entries(report.finalBalances).map(([currency, balance]) =>
	`- ${currency}: ${balance.toLocaleString("es-VE")}`
).join("\n")}

${report.observations ? `Observaciones:\n${report.observations}` : ""}

Generado el: ${new Date().toLocaleString("es-VE")}
			`.trim();

			// Generar nombre de archivo único
			const fileName = `cierre_caja_${new Date().toISOString().split("T")[0]}_${Date.now()}.txt`;

			// Persistir reporte en base de datos
			const reportData = {
				sessionId: currentSession.value.id,
				cashierId: currentSession.value.cashierId || "admin",
				cashierName: currentSession.value.cashierName || "Administrador",
				reportType: "closing_report",
				reportData: {
					reportContent,
					reportSummary: report,
					generatedAt: new Date().toISOString()
				},
				fileName,
				filePath: undefined // No guardamos archivo en servidor, solo en BD
			};

			// Debug: Verificar datos antes de guardar
			console.log("Datos del reporte a guardar:", {
				sessionId: reportData.sessionId,
				cashierId: reportData.cashierId,
				cashierName: reportData.cashierName,
				reportType: reportData.reportType
			});

			const savedReport = await cashClosingDB.createCashReport(reportData);
			console.log("✅ Reporte guardado en base de datos:", savedReport);

			// Descargar archivo
			if (typeof window !== "undefined") {
				const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				console.log("✅ Archivo de reporte descargado exitosamente");
			}

			return reportContent;
		} catch (error) {
			console.error("Error generating report:", error);
			throw error;
		} finally {
			isGeneratingReport.value = false;
		}
	};

	const openCashSession = async (initialBalance?: Record<string, number>): Promise<void> => {
		try {
			// Verificar si ya hay una sesión abierta
			const activeSession = await cashClosingDB.getActiveCashSession();
			if (activeSession) {
				console.log("Ya hay una sesión de caja abierta");
				// Mapear campos de snake_case a camelCase
				const mappedSession = {
					id: activeSession.id,
					tenantId: activeSession.tenant_id,
					cashierId: activeSession.cashier_id || "admin",
					cashierName: activeSession.cashier_name || "Administrador",
					startTime: activeSession.start_time,
					endTime: activeSession.end_time,
					initialBalances: activeSession.initial_balances,
					status: activeSession.status,
					createdAt: activeSession.created_at,
					updatedAt: activeSession.updated_at
				};
				currentSession.value = mappedSession;
				shiftStartTime.value = new Date(mappedSession.startTime);
				isCashSessionOpen.value = true;
				await refreshTodayTransactions();
				return;
			}

			// Crear nueva sesión en base de datos
			const sessionData = {
				cashierId: getCashierInfo.value.cashierId,
				cashierName: getCashierInfo.value.cashierName,
				initialBalances: initialBalance || accountBalances.value
			};

			const newSession = await cashClosingDB.createCashSession(sessionData);

			// Actualizar estado local - mapear campos de snake_case a camelCase
			const mappedSession = {
				id: newSession.id,
				tenantId: newSession.tenant_id,
				cashierId: newSession.cashier_id || "admin",
				cashierName: newSession.cashier_name || "Administrador",
				startTime: newSession.start_time,
				endTime: newSession.end_time,
				initialBalances: newSession.initial_balances,
				status: newSession.status,
				createdAt: newSession.created_at,
				updatedAt: newSession.updated_at
			};
			currentSession.value = mappedSession;
			shiftStartTime.value = new Date(mappedSession.startTime);
			isCashSessionOpen.value = true;

			console.log("✅ Sesión de caja abierta exitosamente:", newSession);
			await refreshTodayTransactions();
		} catch (error) {
			console.error("Error opening cash session:", error);
			throw error;
		}
	};

	return {
		// Estado
		isProcessing: readonly(isProcessing),
		isGeneratingReport: readonly(isGeneratingReport),
		currentShift: readonly(currentShift),
		currentSession: readonly(currentSession),
		shiftStartTime: readonly(shiftStartTime),
		isCashSessionOpen: readonly(isCashSessionOpen),

		// Computed
		accountBalances,
		todayTransactions,

		// Métodos de sesión
		openCashSession,
		closeCashSession,
		initializeCashSession,

		// Métodos de cierre
		startShift,
		getSalesSummary,
		getPaymentMethodsSummary,
		generateCashClosingReport,
		generateReport,
		processCashClosing,

		// Métodos de utilidad
		getShiftDuration,
		formatShiftTime,
		formatShiftDate,
		calculateBalanceDifferences,

		// Acceso directo al DB
		cashClosingDB
	};
}
