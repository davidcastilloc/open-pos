# 🗄️ Base de Datos y Migraciones

El proyecto usa SQLite con Drizzle ORM.

## Esquemas y conexión

- Esquemas: `app/database/schema/`
- Conexión/utilidades: `app/database/connection.ts`
- Tipos y validaciones: Zod en `app/schemas/`

Consulta `BASE-DE-DATOS-INICIALIZADA.md` para estructura y datos iniciales.

## Migraciones

- Ruta: `src-tauri/database/migrations/`
- Generar migraciones:

```bash
pnpm db:generate
```

- Aplicar migraciones:

```bash
pnpm db:migrate
```

- Studio (visual):

```bash
pnpm db:studio
```

## Notas

- Mantén sincronizado Drizzle (esquemas) con migraciones.
- Evita cambios manuales en SQL generados salvo necesidades avanzadas.

