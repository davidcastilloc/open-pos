# 📘 Índice Canónico y Fuente de Verdad

Este documento define qué archivos son la fuente oficial para cada tema y cómo mantener la documentación coherente.

## Objetivo

- Centralizar la documentación técnica activa del proyecto.
- Evitar contradicciones entre reportes históricos y estado real.
- Definir una política de actualización simple y verificable.

## Fuente de Verdad por Tema

| Tema | Documento canónico | Estado |
|---|---|---|
| Estructura y convenciones | `docs/project-structure.md` | Activo |
| Base de datos y migraciones | `docs/database.md` | Activo |
| UI y reglas de diseño | `docs/ui-guidelines.md` | Activo |
| Testing | `docs/testing.md` | Activo |
| Tauri | `docs/tauri.md` | Activo |
| Versionado | `docs/versioning.md` | Activo |
| Productos e inventario | `docs/products-inventory.md` | Activo |
| Devoluciones | `docs/returns-system.md` | Activo |
| Cierre de caja | `docs/cash-closing.md` | Activo |
| Usuarios y notificaciones | `docs/users-notifications.md` | Activo |
| Tasas de cambio | `docs/currency-apis.md` | Activo |
| Brechas PRD vs estado real | `docs/ANALISIS-UNIFICADO-PRD.md` | Activo |
| Backlog ejecutable | `docs/ISSUES-MILESTONES.md` | Activo |

## Documentos de Contexto (No Canónicos)

Estos archivos se mantienen como histórico y no deben usarse como fuente primaria del estado actual:

- `ESTADO-ACTUAL-PROYECTO.md`
- `ANALISIS-PRD-vs-ESTADO.md`
- `ROADMAP-TAREAS-DESARROLLO.md`
- `RESUMEN-EJECUTIVO-v*.md`
- `*-COMPLETADA.md`, `*-IMPLEMENTADO.md`, `*-INICIALIZADA.md`

Regla: si un documento histórico contradice un documento canónico, prevalece el canónico en `docs/`.

## Contradicciones Detectadas

1. Varios documentos históricos declaran el proyecto como "100% completado", pero el análisis unificado mantiene brechas abiertas (tickets/facturas, exportaciones y capacidades SaaS).
2. Existen checklists antiguas con tareas marcadas de forma inconsistente con el estado funcional real.
3. La narrativa de "listo para producción total" no distingue entre MVP local y funcionalidades SaaS pendientes.

## Propuesta de Actualización

1. Congelar documentos históricos como "snapshot".
  - Añadir aviso en cabecera: `Documento histórico (no fuente de verdad)`.
2. Mantener un único estado operativo en `docs/ANALISIS-UNIFICADO-PRD.md`.
  - Actualizar este archivo cuando se cierre una brecha del backlog.
3. Mantener un único backlog ejecutable en `docs/ISSUES-MILESTONES.md`.
  - Cualquier tarea nueva se agrega allí (no en roadmaps legacy).
4. Alinear README raíz y `docs/README.md` al índice canónico.
  - Enlaces principales deben apuntar a documentos activos en `docs/`.
5. Política de mantenimiento documental por PR:
  - Todo PR funcional que cambie comportamiento debe tocar al menos un documento canónico relevante.
  - Si no requiere documentación, debe indicarlo explícitamente en el PR.

## Checklist de Gobernanza (rápido)

- [ ] ¿El cambio afecta comportamiento de usuario o arquitectura?
- [ ] ¿Se actualizó el documento canónico correspondiente?
- [ ] ¿Se evitó editar roadmap/estado legacy para estado operativo?
- [ ] ¿Los enlaces del README siguen apuntando a documentos canónicos?

