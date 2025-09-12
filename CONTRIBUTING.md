# 🤝 Contribuir al Proyecto

¡Gracias por tu interés en contribuir!

## Requisitos

- Node >= 23, pnpm, Rust toolchain.
- TypeScript estricto, ESM, sin `any`.
- Lint: `pnpm lint` debe pasar.

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/...`, `fix/...`, `docs/...`.
2. Asegura tests si la funcionalidad es crítica (Vitest).
3. Ejecuta `pnpm lint` y `pnpm type-check`.
4. Abre PR con descripción clara y capturas si aplica.

## Convención de commits

Sigue Conventional Commits:

- `feat(scope): ...` nuevas funcionalidades
- `fix(scope): ...` correcciones
- `docs(scope): ...` documentación
- `refactor(scope): ...` refactor sin cambios funcionales
- `test(scope): ...` pruebas
- `chore/ci/build(scope): ...` mantenimiento

Esto habilita `semantic-release` para versionado automático.

## Lanzamientos

Los releases se gestionan con `semantic-release`. Ver `docs/versioning.md` y `SEMANTIC-RELEASE-FIX.md`.

