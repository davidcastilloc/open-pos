// Exportar todos los esquemas
export * from './products'
export * from './sales'
export * from './accounts'
export * from './config'

// Re-exportar tipos principales
export type {
  Product,
  NewProduct,
  Category,
  NewCategory,
  Sale,
  NewSale,
  SaleItem,
  NewSaleItem,
  Customer,
  NewCustomer,
  Account,
  NewAccount,
  Transaction,
  NewTransaction,
  CashClosing,
  NewCashClosing,
  SystemConfig,
  NewSystemConfig,
  ExchangeRate,
  NewExchangeRate,
  SyncQueue,
  NewSyncQueue
} from './products'
