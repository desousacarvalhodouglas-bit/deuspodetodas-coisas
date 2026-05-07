#!/usr/bin/env bash
# ============================================================
# Build Script para o Backend no Render
# ============================================================
set -o errexit

echo "==> Atualizando pip"
pip install --upgrade pip

echo "==> Instalando dependencias do requirements.txt"
pip install -r requirements.txt

echo "==> Build concluido com sucesso"
