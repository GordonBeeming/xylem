#!/usr/bin/env bash
set -euo pipefail

for PORT in 3000 4001; do
  pids=$(lsof -ti:"$PORT" || true)
  if [ -n "$pids" ]; then
    echo "Killing existing process(es) on port $PORT (PID $(echo "$pids" | tr '\n' ' '))"
    echo "$pids" | xargs kill
    sleep 1
  fi
done

exec pnpm dev:tina
