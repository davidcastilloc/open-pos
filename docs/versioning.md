# 🏷️ Versionado y Releases

El proyecto usa `semantic-release` para versionado automático y changelog.

## Fuentes

- Configuración: `.releaserc.json` (ver `SEMANTIC-RELEASE-FIX.md`)
- Workflow: `.github/workflows/release.yml`
- Changelog: `CHANGELOG.md` y `public/CHANGELOG.md`
- Versión runtime: `public/version.json`

## Scripts útiles

```bash
pnpm test:semantic-release   # prueba local de configuración
npx semantic-release --dry-run
./scripts/sync-production-branch.sh
```

## Convención de commits

Sigue Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.
