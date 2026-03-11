# Tools

## Tauri MCP Bridge (Primary for Tauri tasks)

Use the Tauri MCP bridge for all desktop-app runtime work in this repository.

- Expected runtime endpoint: `localhost:9223`
- Required first step: start/check `driver_session`
- Core usage:
  - `webview_*`: DOM snapshots, interactions, keyboard input, screenshots
  - `ipc_*`: command execution, event emit, IPC monitor/capture
  - `read_logs`: console/system logs
  - `manage_window`: list/inspect/resize windows
- Policy: if the task is about Tauri behavior, prefer MCP evidence over static assumptions.
