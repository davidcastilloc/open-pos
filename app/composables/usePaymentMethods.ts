/**
 * Helper para manejar métodos de pago y su mapeo entre UI y backend
 */

// Métodos de pago del UI (como aparecen en los selects)
export const UI_PAYMENT_METHODS = {
  CASH: 'cash',
  DEBIT_CARD: 'debit_card', 
  CREDIT_CARD: 'credit_card',
  TRANSFER: 'transfer',
  MOBILE_PAYMENT: 'mobile_payment'
} as const;

// Métodos de pago del backend (como se guardan en la BD)
export const BACKEND_PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer'
} as const;

// Mapeo de UI a Backend
export const PAYMENT_METHOD_MAPPING: Record<string, string> = {
  [UI_PAYMENT_METHODS.CASH]: BACKEND_PAYMENT_METHODS.CASH,
  [UI_PAYMENT_METHODS.DEBIT_CARD]: BACKEND_PAYMENT_METHODS.CARD,
  [UI_PAYMENT_METHODS.CREDIT_CARD]: BACKEND_PAYMENT_METHODS.CARD,
  [UI_PAYMENT_METHODS.TRANSFER]: BACKEND_PAYMENT_METHODS.TRANSFER,
  [UI_PAYMENT_METHODS.MOBILE_PAYMENT]: BACKEND_PAYMENT_METHODS.TRANSFER
};

// Opciones para el UI (como aparecen en los selects)
export const PAYMENT_METHOD_OPTIONS = [
  { label: "Efectivo", value: UI_PAYMENT_METHODS.CASH },
  { label: "Tarjeta de Débito", value: UI_PAYMENT_METHODS.DEBIT_CARD },
  { label: "Tarjeta de Crédito", value: UI_PAYMENT_METHODS.CREDIT_CARD },
  { label: "Transferencia", value: UI_PAYMENT_METHODS.TRANSFER },
  { label: "Pago Móvil", value: UI_PAYMENT_METHODS.MOBILE_PAYMENT }
];

/**
 * Mapea un método de pago del UI al backend
 */
export function mapPaymentMethodToBackend(uiMethod: string): string {
  return PAYMENT_METHOD_MAPPING[uiMethod] || BACKEND_PAYMENT_METHODS.CASH;
}

/**
 * Obtiene la etiqueta legible de un método de pago
 */
export function getPaymentMethodLabel(method: string): string {
  const option = PAYMENT_METHOD_OPTIONS.find(opt => opt.value === method);
  return option?.label || method;
}

/**
 * Obtiene el ícono para un método de pago
 */
export function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    [UI_PAYMENT_METHODS.CASH]: "i-heroicons-banknotes",
    [UI_PAYMENT_METHODS.DEBIT_CARD]: "i-heroicons-credit-card",
    [UI_PAYMENT_METHODS.CREDIT_CARD]: "i-heroicons-credit-card", 
    [UI_PAYMENT_METHODS.TRANSFER]: "i-heroicons-arrow-path",
    [UI_PAYMENT_METHODS.MOBILE_PAYMENT]: "i-heroicons-device-phone-mobile"
  };
  return icons[method] || "i-heroicons-question-mark-circle";
}

/**
 * Valida que un método de pago sea válido
 */
export function isValidPaymentMethod(method: string): boolean {
  return Object.values(UI_PAYMENT_METHODS).includes(method as any);
}
