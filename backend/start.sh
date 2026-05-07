#!/usr/bin/env bash
# ============================================================
# Start Script para o Backend no Render
# ============================================================
set -o errexit

echo "==> Iniciando servidor FastAPI"
uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
