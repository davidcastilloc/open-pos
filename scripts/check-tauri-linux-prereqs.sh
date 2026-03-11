#!/usr/bin/env bash
set -euo pipefail

if [[ "${OSTYPE:-}" != linux* ]]; then
	echo "[WARN] This checker is intended for Linux hosts."
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAURI_DIR="$ROOT_DIR/src-tauri"
TARGET_DIR="$TAURI_DIR/target/debug/deps"

status_ok=true

ok() {
	echo "[OK] $1"
}

warn() {
	echo "[WARN] $1"
}

fail() {
	echo "[MISSING] $1"
	status_ok=false
}

check_cmd() {
	local cmd="$1"
	if command -v "$cmd" >/dev/null 2>&1; then
		ok "command '$cmd' found"
	else
		fail "command '$cmd' not found"
	fi
}

check_pkg() {
	local spec="$1"
	if pkg-config --exists "$spec"; then
		local version
		version="$(pkg-config --modversion "$spec" 2>/dev/null || true)"
		ok "pkg-config '$spec' available${version:+ (v$version)}"
	else
		fail "pkg-config '$spec' not found"
	fi
}

echo "== Host =="
if command -v ldd >/dev/null 2>&1; then
	ldd --version | sed -n '1p'
fi
uname -sr || true
if [[ -f /etc/os-release ]]; then
	grep '^PRETTY_NAME=' /etc/os-release | cut -d= -f2- | tr -d '"' || true
fi

echo
echo "== Toolchain =="
check_cmd node
check_cmd pnpm
check_cmd rustc
check_cmd cargo
check_cmd pkg-config

echo
echo "== Runtime libraries (Tauri/Linux) =="
check_pkg "glib-2.0 >= 2.70"
if pkg-config --exists "glib-2.0"; then
	glib_raw_version="$(pkg-config --modversion glib-2.0 2>/dev/null || true)"
	if [[ -n "$glib_raw_version" ]] && [[ "$(printf '%s\n' "2.70" "$glib_raw_version" | sort -V | tail -n1)" != "$glib_raw_version" ]]; then
		warn "glib-2.0 detected (v$glib_raw_version) but Tauri stack requires >= 2.70. Use Fedora 40+/Ubuntu 24.04+ or toolbox/podman."
	fi
fi
check_pkg "gobject-2.0"
check_pkg "gio-2.0"
check_pkg "gtk+-3.0"

if pkg-config --exists "webkit2gtk-4.1"; then
	check_pkg "webkit2gtk-4.1"
	check_pkg "javascriptcoregtk-4.1"
	check_pkg "libsoup-3.0"
elif pkg-config --exists "webkit2gtk-4.0"; then
	check_pkg "webkit2gtk-4.0"
	check_pkg "javascriptcoregtk-4.0"
	if pkg-config --exists "libsoup-3.0"; then
		check_pkg "libsoup-3.0"
	else
		check_pkg "libsoup-2.4"
	fi
else
	fail "webkit2gtk-4.1 or webkit2gtk-4.0 not found"
fi

echo
echo "== Binary compatibility check (cached Rust artifacts) =="
if compgen -G "$TARGET_DIR/libsqlx_macros-*.so" > /dev/null; then
	host_glibc="$(ldd --version 2>/dev/null | sed -n '1p' | sed -E 's/.* ([0-9]+\.[0-9]+).*/\1/')"
	required_glibc="$({ strings "$TARGET_DIR"/libsqlx_macros-*.so 2>/dev/null || true; } | grep -oE 'GLIBC_[0-9]+\.[0-9]+' | sed 's/GLIBC_//' | sort -V | tail -n1)"

	if [[ -n "$required_glibc" ]]; then
		echo "max required by cached libsqlx_macros: GLIBC_$required_glibc"
		echo "host glibc: GLIBC_${host_glibc:-unknown}"
		if [[ -n "${host_glibc:-}" ]] && [[ "$(printf '%s\n' "$required_glibc" "$host_glibc" | sort -V | tail -n1)" != "$host_glibc" ]]; then
			warn "cached Rust artifacts require newer glibc than host. Run: cargo clean --manifest-path src-tauri/Cargo.toml"
		fi
	else
		warn "could not determine cached GLIBC requirement"
	fi
else
	ok "no cached libsqlx_macros artifact found"
fi

echo
echo "== Install hints =="
echo "Fedora/CentOS/RHEL:"
echo "  sudo dnf install -y glib2-devel gtk3-devel webkit2gtk4.1-devel libsoup3-devel javascriptcoregtk4.1-devel"
echo "Ubuntu/Debian:"
echo "  sudo apt-get install -y libglib2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev"

if [[ "$status_ok" == true ]]; then
	echo
	echo "Result: prerequisites look good."
	exit 0
fi

echo
echo "Result: missing prerequisites detected."
exit 1
