#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "⚽ Iniciando Quiniela Mundial 2026..."
echo ""

pkill -f "node --no-warnings server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

(cd "$SCRIPT_DIR/backend"  && node --no-warnings server.js) &
BACKEND_PID=$!
echo "✅ Backend  → http://localhost:3001"

(cd "$SCRIPT_DIR/frontend" && npm run dev -- --open) &
FRONTEND_PID=$!
echo "✅ Frontend → http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servicios detenidos.'" INT TERM
wait
