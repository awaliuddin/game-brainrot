#!/usr/bin/env bash
set -euo pipefail

ACTIVATE=false
RESTART=false
PORT=8000
HOST=127.0.0.1

usage() {
  echo "Usage: $0 [-a|--activate] [-r|--restart] [--port N] [--host H]" >&2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a|--activate) ACTIVATE=true; shift ;;
    -r|--restart)  RESTART=true;  shift ;;
    --port)        PORT="$2";    shift 2 ;;
    --host)        HOST="$2";    shift 2 ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

# Resolve repo root relative to this script
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_ROOT="$( cd -- "${SCRIPT_DIR}/.." &> /dev/null && pwd )"
echo "Repo root: ${REPO_ROOT}"

cd "$REPO_ROOT"

if $ACTIVATE; then
  if [[ -f ".venv/Scripts/activate" ]]; then
    echo "Activating venv (.venv)..."
    # shellcheck source=/dev/null
    source .venv/Scripts/activate
  else
    echo ".venv not found. Create it first: python -m venv .venv" >&2
    exit 1
  fi
fi

if $RESTART; then
  echo "Killing process bound to ${HOST}:${PORT} (if any)..."
  # Use Windows netstat output, filter by port and LISTENING, grab last col (PID)
  PIDS=$(netstat -aon 2>/dev/null | grep ":${PORT} " | grep LISTENING | awk '{print $NF}' | sort -u)
  if [[ -n "${PIDS}" ]]; then
    for pid in $PIDS; do
      echo "Stopping PID ${pid}"
      /c/Windows/System32/taskkill.exe /F /PID "$pid" >/dev/null 2>&1 || true
    done
  fi
fi

echo "Starting XTTS backend on ${HOST}:${PORT}..."
# Run uvicorn in the foreground
exec uvicorn api.tts_server:app --port "${PORT}" --host "${HOST}"
