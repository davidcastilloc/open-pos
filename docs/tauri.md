# 🖥️ Integración Tauri 2

La aplicación se ejecuta como desktop app usando Tauri 2.

## Plugins usados

- `@tauri-apps/plugin-fs` — Archivos
- `@tauri-apps/plugin-notification` — Notificaciones
- `@tauri-apps/plugin-os` — Información del SO
- `@tauri-apps/plugin-shell` — Comandos del sistema
- `@tauri-apps/plugin-store` — Almacenamiento clave-valor
- `@tauri-apps/plugin-sql` — Acceso SQL (si aplica)

Capacidades: `src-tauri/capabilities/main.json`.

## Desarrollo

```bash
pnpm tauri:check:linux  # Solo Linux: valida toolchain + librerías del sistema
cargo clean --manifest-path src-tauri/Cargo.toml  # recomendado al cambiar host/SO
pnpm tauri:dev
```

## MCP Bridge para automatización y debugging

Este proyecto soporta automatización de la app Tauri en ejecución mediante MCP Bridge.

Cuando la app inicia correctamente, el plugin expone un WebSocket (por defecto `0.0.0.0:9223`) con logs similares a:

```txt
[MCP][PLUGIN][INFO] MCP Bridge plugin initialized for 'OpenPos' (...) on 0.0.0.0:9223
[MCP][WS_SERVER][INFO] WebSocket server listening on: 0.0.0.0:9223
```

Uso recomendado:

1. Levantar la app con `pnpm tauri:dev` o ejecutable debug.
2. Verificar que el bridge está escuchando en `localhost:9223`.
3. Conectar un cliente MCP y usarlo como interfaz principal para tareas Tauri:
   - Inspección/interacción UI (`webview_*`)
   - IPC de frontend-backend (`ipc_*`)
   - Logs y estado runtime (`read_logs`, backend state, ventanas)

Regla práctica: para cualquier incidencia o validación de comportamiento desktop, priorizar evidencia vía MCP sobre suposiciones.

## Build

```bash
pnpm tauri:build      # producción
pnpm tauri:build:debug
```

Requisitos de Rust por SO: ver `https://v2.tauri.app/start/prerequisites`.

## Linux: prerequisitos nativos

En Linux, Tauri/WebKit requiere librerías del sistema además de Rust/Node.

Chequeo rápido:

```bash
pnpm tauri:check:linux
```

Instalación base (Fedora/CentOS/RHEL):

```bash
sudo dnf install -y glib2-devel gtk3-devel webkit2gtk4.1-devel libsoup3-devel javascriptcoregtk4.1-devel
```

Nota: en CentOS Stream 9, `glib-2.0` suele ser `2.68.x` (menor a `2.70`) y puede seguir fallando aunque instales `-devel`. En ese caso usa host más nuevo o contenedor/toolbox.

Instalación base (Ubuntu/Debian):

```bash
sudo apt-get install -y libglib2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev
```

## Troubleshooting Linux (bloqueos comunes)

### 1) `GLIBC_2.39 not found` al compilar Tauri

Síntoma típico:

```txt
.../libsqlx_macros-*.so: /lib64/libc.so.6: version `GLIBC_2.39' not found
```

Causa: artefactos en `src-tauri/target` compilados en otro host con glibc más nueva.

Solución:

```bash
cargo clean --manifest-path src-tauri/Cargo.toml
pnpm tauri:dev
```

### 2) `glib-2.0.pc` (u otros `.pc`) no encontrado

Síntoma típico:

```txt
The system library `glib-2.0` required by crate `glib-sys` was not found.
```

Causa: faltan paquetes `-devel`/`-dev` para GTK/WebKit.

Solución:

1. Instalar dependencias del SO (ver sección anterior).
2. Reintentar `pnpm tauri:check:linux`.
3. Ejecutar `pnpm tauri:dev`.

### 3) Host con `glib-2.0 < 2.70` (ej. CentOS Stream 9)

Síntoma típico:

```txt
[MISSING] pkg-config 'glib-2.0 >= 2.70' not found
```

Solución recomendada (reproducible): usar `toolbox`/`podman` con Fedora 40+.

Ejemplo con toolbox:

```bash
toolbox create -c tauri-dev --image registry.fedoraproject.org/fedora-toolbox:40
toolbox run -c tauri-dev bash -lc 'cd /home/$USER/git-proyects/open-pos && pnpm tauri:check:linux'
```

## Buenas prácticas

- Encapsular llamadas Tauri en composables Nuxt. Ejemplo:

```ts
// app/composables/useReadFile.ts
import { readTextFile } from "@tauri-apps/plugin-fs";

export async function useReadFile(path: string) {
	return await readTextFile(path);
}
```
