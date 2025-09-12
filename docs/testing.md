# 🧪 Testing y Calidad

Se usa Vitest para pruebas unitarias e integración ligera.

## Comandos

```bash
pnpm test       # corre pruebas
pnpm test:ui    # interfaz interactiva
pnpm type-check # verificación de tipos
pnpm lint       # estilo y reglas
```

## Setup

- Archivo: `test/setup.ts`
- Config: `vitest.config.ts`

## Buenas prácticas

- Pruebas para lógica crítica: ventas, inventario, totales, conversión de moneda.
- Aislar composables y validar con entradas de Zod válidas/ inválidas.
- Evitar mocks innecesarios; usar funciones puras cuando sea posible.


