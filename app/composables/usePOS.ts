import { computed, readonly, ref } from "vue";
import { useConfig } from "./useConfig";
import { useCurrency } from "./useCurrency";
import { useDatabase } from "./useDatabase";
import { mapPaymentMethodToBackend } from "./usePaymentMethods";

export interface CartItem {
	id: string
	productId: string
	name: string
	price: number
	quantity: number
	total: number
	currency: string
	category?: string
	image?: string
}

export interface Sale {
	id: string
	items: CartItem[]
	subtotal: number
	tax: number
	discount: number
	total: number
	currency: string
	paymentMethod: string
	customerId?: string
	cashierId: string
	createdAt: string
}

export function usePOS() {
	const { query, execute, transaction } = useDatabase();
	const { convertAmount, formatCurrency } = useCurrency();
	const { getCurrencyConfig } = useConfig();

	// Estado del carrito
	const cart = ref<CartItem[]>([]);
	const currentCurrency = ref<string>("BS");
	const discount = ref<number>(0);
	const discountType = ref<"percentage" | "amount">("percentage");
	const customerId = ref<string | null>(null);
	const cashierId = ref<string>("admin"); // TODO: Obtener del usuario actual

	// Estado de la venta
	const isProcessing = ref(false);
	const error = ref<string | null>(null);

	// Agregar producto al carrito
	const addToCart = async (productId: string, quantity: number = 1) => {
		try {
			// Buscar producto en la base de datos
			const product = await query<any>(
				"SELECT * FROM products WHERE id = ? AND is_active = 1",
				[productId]
			);

			if (!product || product.length === 0) {
				throw new Error("Producto no encontrado");
			}

			const productData = product[0];

			// Verificar stock
			if (productData.stock < quantity) {
				throw new Error("Stock insuficiente");
			}

			// Convertir precio a la moneda actual
			const price = convertAmount(
				productData.price,
				productData.currency || "BS", // Usar la moneda del producto
				currentCurrency.value
			);

			// Verificar si el producto ya está en el carrito
			const existingItem = cart.value.find((item) => item.productId === productId);

			if (existingItem) {
				// Actualizar cantidad
				existingItem.quantity += quantity;
				existingItem.total = existingItem.price * existingItem.quantity;
			} else {
				// Agregar nuevo item
				const newItem: CartItem = {
					id: `cart_${Date.now()}_${Math.random()}`,
					productId: productData.id,
					name: productData.name,
					price,
					quantity,
					total: price * quantity,
					currency: currentCurrency.value,
					category: productData.category_id,
					image: productData.images ? JSON.parse(productData.images)[0] : undefined
				};
				cart.value.push(newItem);
			}

			console.log("✅ Producto agregado al carrito:", productData.name);
		} catch (err) {
			error.value = `Error al agregar producto: ${err}`;
			console.error("Error adding to cart:", err);
		}
	};

	// Remover producto del carrito
	const removeFromCart = (itemId: string) => {
		const index = cart.value.findIndex((item) => item.id === itemId);
		if (index > -1) {
			cart.value.splice(index, 1);
			console.log("✅ Producto removido del carrito");
		}
	};

	// Actualizar cantidad de un item
	const updateQuantity = (itemId: string, quantity: number) => {
		const item = cart.value.find((item) => item.id === itemId);
		if (item) {
			if (quantity <= 0) {
				removeFromCart(itemId);
			} else {
				item.quantity = quantity;
				item.total = item.price * quantity;
				console.log("✅ Cantidad actualizada");
			}
		}
	};

	// Limpiar carrito
	const clearCart = () => {
		cart.value = [];
		discount.value = 0;
		customerId.value = null;
		console.log("✅ Carrito limpiado");
	};

	// Calcular subtotal
	const subtotal = computed(() => {
		return cart.value.reduce((sum, item) => sum + item.total, 0);
	});

	// Calcular descuento
	const discountAmount = computed(() => {
		if (discountType.value === "percentage") {
			return (subtotal.value * discount.value) / 100;
		}
		return discount.value;
	});

	// Calcular impuestos (IVA 16% + ISLR 2%)
	const tax = computed(() => {
		const taxableAmount = subtotal.value - discountAmount.value;
		const iva = taxableAmount * 0.16; // IVA 16%
		const islr = taxableAmount * 0.02; // ISLR 2%
		return iva + islr;
	});

	// Calcular total
	const total = computed(() => {
		return subtotal.value - discountAmount.value + tax.value;
	});

	// Aplicar descuento
	const applyDiscount = (amount: number, type: "percentage" | "amount" = "percentage") => {
		discount.value = amount;
		discountType.value = type;
		console.log(`✅ Descuento aplicado: ${amount}${type === "percentage" ? "%" : ""}`);
	};

	// Cambiar moneda
	const changeCurrency = async (newCurrency: string) => {
		try {
			// Convertir todos los precios del carrito
			for (const item of cart.value) {
				const newPrice = convertAmount(
					item.price,
					item.currency,
					newCurrency
				);
				item.price = newPrice;
				item.currency = newCurrency;
				item.total = item.price * item.quantity;
			}

			currentCurrency.value = newCurrency;
			console.log(`✅ Moneda cambiada a: ${newCurrency}`);
		} catch (err) {
			error.value = `Error al cambiar moneda: ${err}`;
			console.error("Error changing currency:", err);
		}
	};

	// Procesar venta
	const processSale = async (paymentMethod: string, paymentAccountId?: string, saleCustomerId?: string) => {
		if (cart.value.length === 0) {
			throw new Error("El carrito está vacío");
		}

		isProcessing.value = true;
		error.value = null;

		try {
			const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Crear la venta en la base de datos
			await transaction(async (db) => {
				// Insertar venta principal
				await db.execute(
					`INSERT INTO sales 
           (id, tenant_id, customer_id, subtotal, tax, discount, total, payment_method, cashier_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
					[
						saleId,
						"default",
						saleCustomerId || customerId.value,
						subtotal.value,
						tax.value,
						discountAmount.value,
						total.value,
						paymentMethod,
						cashierId.value
					]
				);

				// Insertar items de la venta
				for (const item of cart.value) {
					await db.execute(
						`INSERT INTO sale_items 
             (id, sale_id, product_id, quantity, price, total, created_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
						[
							`item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
							saleId,
							item.productId,
							item.quantity,
							item.price,
							item.total
						]
					);

					// Actualizar stock del producto
					await db.execute(
						"UPDATE products SET stock = stock - ? WHERE id = ?",
						[item.quantity, item.productId]
					);
				}

				// Determinar cuenta de pago
				let accountRow: any | undefined;
				if (paymentAccountId) {
					const rows = await db.select("SELECT * FROM accounts WHERE id = ? AND is_active = 1", [paymentAccountId]);
					accountRow = rows[0];
				} else {
					const rows = await db.select(
						"SELECT * FROM accounts WHERE type = 'cash' AND currency = ? AND is_active = 1 ORDER BY created_at ASC LIMIT 1",
						[currentCurrency.value]
					);
					accountRow = rows[0];
				}

				if (!accountRow) {
					throw new Error(`No hay cuenta de efectivo activa para la moneda ${currentCurrency.value}`);
				}
				if (accountRow.currency !== currentCurrency.value) {
					throw new Error(`La moneda de la cuenta (${accountRow.currency}) no coincide con la de la venta (${currentCurrency.value})`);
				}

				// Registrar transacción contable de la venta
				const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				const backendPaymentMethod = mapPaymentMethodToBackend(paymentMethod);
				await db.execute(
					`INSERT INTO transactions (id, tenant_id, account_id, type, amount, currency, exchange_rate, reference, description, cashier_id, sale_id, payment_method, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
					[
						txId,
						"default",
						accountRow.id,
						"sale",
						total.value,
						currentCurrency.value,
						null,
						saleId,
						`Venta POS ${saleId}`,
						cashierId.value,
						saleId,
						backendPaymentMethod
					]
				);

				// Actualizar saldo de la cuenta (+)
				await db.execute(
					"UPDATE accounts SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?",
					[total.value, accountRow.id]
				);

				// Registrar venta del cliente si hay un cliente asociado
				if (saleCustomerId || customerId.value) {
					const finalCustomerId = saleCustomerId || customerId.value;
					await db.execute(
						`INSERT INTO customer_sales (id, customer_id, sale_id, total_amount, currency, created_at)
						 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
						[
							`cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
							finalCustomerId,
							saleId,
							total.value,
							currentCurrency.value
						]
					);
				}
			});

			// Limpiar carrito después de la venta exitosa
			clearCart();

			console.log("✅ Venta procesada exitosamente:", saleId);
			return saleId;
		} catch (err) {
			error.value = `Error al procesar venta: ${err}`;
			console.error("Error processing sale:", err);
			throw err;
		} finally {
			isProcessing.value = false;
		}
	};

	// Formatear moneda
	const formatPrice = (amount: number, currency: string = currentCurrency.value) => {
		return formatCurrency(amount, currency);
	};

	// Obtener resumen de la venta
	const getSaleSummary = computed(() => {
		return {
			items: cart.value.length,
			subtotal: subtotal.value,
			discount: discountAmount.value,
			tax: tax.value,
			total: total.value,
			currency: currentCurrency.value
		};
	});

	return {
		// Estado
		cart: readonly(cart),
		currentCurrency: readonly(currentCurrency),
		discount: readonly(discount),
		discountType: readonly(discountType),
		customerId: readonly(customerId),
		isProcessing: readonly(isProcessing),
		error: readonly(error),

		// Computed
		subtotal,
		discountAmount,
		tax,
		total,
		getSaleSummary,

		// Métodos
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		applyDiscount,
		changeCurrency,
		processSale,
		formatPrice
	};
}
