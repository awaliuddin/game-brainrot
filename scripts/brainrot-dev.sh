#!/usr/bin/env bash
set -euo pipefail

# Default settings
NO_COLOR=false
TTS_PORT=8000
TTS_HOST="127.0.0.1"
WEB_PORT=3000
WEB_HOST="localhost"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-color) NO_COLOR=true; shift ;;
    --tts-port) TTS_PORT="$2"; shift 2 ;;
    --tts-host) TTS_HOST="$2"; shift 2 ;;
    --web-port) WEB_PORT="$2"; shift 2 ;;
    --web-host) WEB_HOST="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--no-color] [--tts-port PORT] [--tts-host HOST] [--web-port PORT] [--web-host HOST]"
      exit 0
      ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# ANSI color codes
if [[ "$NO_COLOR" == "true" ]]; then
  RESET=""
  BOLD=""
  CYAN=""
  GREEN=""
  YELLOW=""
  RED=""
  MAGENTA=""
  BLUE=""
  GRAY=""
else
  RESET="\033[0m"
  BOLD="\033[1m"
  CYAN="\033[36m"
  GREEN="\033[32m"
  YELLOW="\033[33m"
  RED="\033[31m"
  MAGENTA="\033[35m"
  BLUE="\033[34m"
  GRAY="\033[90m"
fi

# Resolve repo root relative to this script
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_ROOT="$( cd -- "${SCRIPT_DIR}/.." &> /dev/null && pwd )"
WEB_ROOT="${REPO_ROOT}/web"

# Helper functions
print_color() {
  local color="$1"
  local text="$2"
  echo -e "${color}${text}${RESET}"
}

print_banner() {
  print_color "$CYAN" "╔════════════════════════════════════════════════════════════════╗"
  print_color "$CYAN" "║                                                                ║"
  print_color "$CYAN" "║  ${BOLD}${MAGENTA}B R A I N R O T   S T U D I O   D E V   S E R V E R${RESET}${CYAN}  ║"
  print_color "$CYAN" "║                                                                ║"
  print_color "$CYAN" "╚════════════════════════════════════════════════════════════════╝"
  echo ""
}

kill_process_on_port() {
  local port="$1"
  print_color "$YELLOW" "🔍 Checking for processes on port ${port}..."
  
  # Find PIDs using the port
  local pids
  if command -v lsof &> /dev/null; then
    # macOS/Linux with lsof
    pids=$(lsof -i ":${port}" -t 2>/dev/null || true)
  else
    # Windows with netstat
    pids=$(netstat -aon 2>/dev/null | grep ":${port}" | grep "LISTENING" | awk '{print $NF}' | sort -u || true)
  fi
  
  if [[ -n "$pids" ]]; then
    for pid in $pids; do
      print_color "$RED" "🛑 Stopping process PID ${pid} on port ${port}"
      if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        taskkill.exe /F /PID "$pid" >/dev/null 2>&1 || true
      else
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
    print_color "$GREEN" "✅ Process(es) terminated successfully"
  else
    print_color "$GREEN" "✅ No processes found on port ${port}"
  fi
}

activate_venv() {
  local venv_path
  
  if [[ -f "${REPO_ROOT}/.venv/Scripts/activate" ]]; then
    venv_path="${REPO_ROOT}/.venv/Scripts/activate"
  elif [[ -f "${REPO_ROOT}/.venv/bin/activate" ]]; then
    venv_path="${REPO_ROOT}/.venv/bin/activate"
  else
    print_color "$RED" "❌ Python virtual environment not found"
    print_color "$YELLOW" "   Create it with: python -m venv .venv"
    exit 1
  fi
  
  print_color "$GREEN" "🐍 Activating Python virtual environment..."
  # shellcheck disable=SC1090
  source "$venv_path"
  
  # Check if activation was successful
  if [[ -z "${VIRTUAL_ENV:-}" ]]; then
    print_color "$RED" "❌ Failed to activate virtual environment"
    exit 1
  fi
  
  print_color "$GREEN" "✅ Virtual environment activated: ${VIRTUAL_ENV}"
}

start_tts_backend() {
  local host="$1"
  local port="$2"
  
  print_color "$GREEN" "🚀 Starting XTTS backend on ${host}:${port}..."
  
  # Start the TTS backend in the background
  cd "$REPO_ROOT" || exit 1
  export PYTHONUNBUFFERED=1
  
  # Start in background and save PID
  uvicorn api.tts_server:app --port "$port" --host "$host" > "${REPO_ROOT}/tts-server.log" 2>&1 &
  TTS_PID=$!
  
  # Wait a moment for the server to start
  sleep 2
  
  # Check if process is still running
  if kill -0 "$TTS_PID" 2>/dev/null; then
    print_color "$GREEN" "✅ XTTS backend started successfully (PID: ${TTS_PID})"
    print_color "$CYAN" "   API available at: http://${host}:${port}"
    print_color "$GRAY" "   Logs available at: ${REPO_ROOT}/tts-server.log"
  else
    print_color "$RED" "❌ XTTS backend failed to start"
    print_color "$YELLOW" "   Check logs at: ${REPO_ROOT}/tts-server.log"
    exit 1
  fi
}

start_nextjs_frontend() {
  local host="$1"
  local port="$2"
  
  print_color "$GREEN" "🚀 Starting Next.js frontend..."
  
  # Check if node_modules exists
  if [[ ! -d "${WEB_ROOT}/node_modules" ]]; then
    print_color "$YELLOW" "📦 Installing frontend dependencies..."
    (cd "$WEB_ROOT" && npm install)
  fi
  
  # Start Next.js
  cd "$WEB_ROOT" || exit 1
  export NEXT_PUBLIC_TTS_BASE="http://${TTS_HOST}:${TTS_PORT}"
  print_color "$CYAN" "🔗 Setting NEXT_PUBLIC_TTS_BASE=${NEXT_PUBLIC_TTS_BASE}"
  
  # Run Next.js (this will take over the terminal)
  exec npm run dev
}

cleanup() {
  print_color "$YELLOW" "🧹 Cleaning up and stopping servers..."
  
  # Kill TTS backend if it's running
  if [[ -n "${TTS_PID:-}" ]] && kill -0 "$TTS_PID" 2>/dev/null; then
    print_color "$YELLOW" "🛑 Stopping TTS backend (PID: ${TTS_PID})"
    kill "$TTS_PID" 2>/dev/null || true
  fi
  
  # Kill any remaining processes on the ports
  kill_process_on_port "$TTS_PORT"
  kill_process_on_port "$WEB_PORT"
  
  print_color "$GREEN" "👋 Goodbye!"
  exit 0
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Main script execution
clear
print_banner

print_color "${BOLD}${MAGENTA}" "🧠 Brainrot Studio Development Server"
print_color "$GRAY" "   Repo root: ${REPO_ROOT}"
echo ""

# Kill processes on ports if they exist
kill_process_on_port "$TTS_PORT"
kill_process_on_port "$WEB_PORT"

# Activate Python virtual environment
activate_venv

# Start TTS backend
start_tts_backend "$TTS_HOST" "$TTS_PORT"

# Start Next.js frontend (this will take over the terminal)
echo ""
print_color "$GREEN" "🌐 Starting Next.js frontend..."
print_color "$CYAN" "   Once started, access the app at: http://${WEB_HOST}:${WEB_PORT}/studio"
echo ""
print_color "$YELLOW" "📋 Press Ctrl+C to stop both servers"
echo ""

start_nextjs_frontend "$WEB_HOST" "$WEB_PORT"
