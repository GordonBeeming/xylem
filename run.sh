#!/usr/bin/env bash
set -euo pipefail

PORT=3000

pids=$(lsof -ti:"$PORT" || true)
if [ -n "$pids" ]; then
  echo "Killing existing process(es) on port $PORT (PID $(echo "$pids" | tr '\n' ' '))"
  echo "$pids" | xargs kill
  sleep 1
fi

exec pnpm dev
