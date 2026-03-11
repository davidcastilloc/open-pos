# Feature Research: Datos del Negocio para POS

**Domain:** Configuración de datos de negocio en POS
**Researched:** 2026-03-11
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Nombre del negocio | El usuario debe poder configurar el nombre que aparecerá en tickets y reportes | LOW | Campo de texto simple con validación de longitud |
| RIF (Registro de Información Fiscal) | Requisito legal en Venezuela para facturación | MEDIUM | Validación específica de formato venezolano (J-XXXXXXXX) |
| Dirección del negocio | Información de contacto para tickets y reportes | LOW | Campo de texto largo (textarea) |
| Teléfono | Información de contacto para clientes | LOW | Campo de texto con validación de formato |
| Logo del negocio | Identidad visual en tickets y pantalla de venta | MEDIUM | Upload de imagen con preview y almacenamiento |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Configuración multi-tenant | Permite múltiples negocios en misma instancia | HIGH | Requiere diseño de base de datos separado |
| Plantillas de tickets personalizables | Control total sobre formato de tickets | MEDIUM | Sistema de templates con variables dinámicas |
| Validación en tiempo real | Mejor UX con feedback inmediato | LOW | Usar Zod validation con eventos en tiempo real |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Sincronización cloud automática | "Quiero acceder desde cualquier lugar" | Requiere infraestructura compleja, problemas de privacidad | Exportación manual de datos |
| Múltiples logos por ubicación | "Tengo varias sucursales" | Complejidad de UI, confusión de datos | Un logo principal + dirección específica |
| Validación RIF con API externa | "Quiero verificar el RIF" | Depende de servicios externos, latencia, costos | Validación de formato local + advertencia |

## Feature Dependencies

```
Configuración de Logo
    └──requires──> Almacenamiento de archivos
                       └──requires──> Permisos de sistema (Tauri)

Validación de RIF
    └──requires──> Patrón de validación Zod

Persistencia de datos
    └──requires──> Conexión a base de datos SQLite
                       └──requires──> Migraciones de Drizzle
```

### Dependency Notes

- **Configuración de Logo requires Almacenamiento de archivos:** El logo debe guardarse en el sistema de archivos local (Tauri FS) y la ruta en la base de datos
- **Persistencia de datos requires Conexión a base de datos:** Actualmente `useConfig` solo guarda en memoria, necesita integración con Drizzle
- **Validación de RIF requires Patrón de validación:** Formato específico venezolano (J/V/E-XXXXXXXX)

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] Campo "Nombre del negocio" con validación de longitud
- [x] Campo "RIF" con validación de formato venezolano (J-123456789)
- [x] Campo "Dirección" con texto largo
- [x] Campo "Teléfono" con formato básico
- [x] Persistencia en base de datos SQLite

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Upload de logo con preview
- [ ] Validación de RIF con API externa (opcional)
- [ ] Plantillas de tickets personalizables

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Multi-tenant con múltiples negocios
- [ ] Sincronización cloud automática
- [ ] Integración con facturación electrónica

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Nombre del negocio | HIGH | LOW | P1 |
| RIF con validación venezolana | HIGH | MEDIUM | P1 |
| Dirección del negocio | MEDIUM | LOW | P1 |
| Teléfono | MEDIUM | LOW | P1 |
| Logo del negocio | MEDIUM | MEDIUM | P2 |
| Validación en tiempo real | HIGH | LOW | P2 |
| Multi-tenant | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Sistema POS Local | Otro POS | Our Approach |
|---------|-------------------|----------|--------------|
| Configuración de negocio | Campos básicos, sin validación | Formularios complejos | Campos esenciales + validación venezolana |
| RIF | Solo campo de texto | Validación automática | Validación de formato + advertencia |
| Logo | No soportado | Upload básico | Upload con preview y almacenamiento local |
| Tickets personalizables | Plantillas fijas | Editor visual | Templates con variables dinámicas |

## Sources

### Primary (HIGH confidence)
- Project context: `.planning/PROJECT.md`, `.planning/phase-01/CONTEXT.md`
- Existing code: `app/composables/useConfig.ts`
- Zod validation: https://zod.dev
- Nuxt UI: https://ui.nuxt.com

### Secondary (MEDIUM confidence)
- Venezuelan RIF format: Government tax documentation
- POS best practices: Industry standards

### Tertiary (LOW confidence)
- Competitor analysis: Public documentation and user reviews

---

*Feature research for: Datos del Negocio POS*
*Researched: 2026-03-11*

## Quality Gate Check

- [x] **Validación de RIF venezolano identificada**: Patrón `/^[JVE]-\d{8}$/i`
- [x] **Patrón de persistencia con useConfig identificado**: Categoría `business` en `defaultConfig`
- [x] **Componentes de UI recomendados**: UInput, UTextarea, UUpload con validación Zod
