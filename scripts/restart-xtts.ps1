param(
  [switch]$Activate,
  [switch]$Restart,
  [int]$Port = 8000,
  [string]$Host = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $root "..")
Write-Host "Repo root: $repoRoot"

# Activate venv if requested
if ($Activate) {
  $venvActivate = Join-Path $repoRoot ".venv/Scripts/Activate.ps1"
  if (-Not (Test-Path $venvActivate)) {
    Write-Error ".venv not found. Create it first: python -m venv .venv"
  }
  Write-Host "Activating venv..."
  & $venvActivate
}

# Stop anything on the port if Restart flag is used
if ($Restart) {
  Write-Host "Killing process bound to $Host:$Port (if any)..."
  # netstat-based find (Windows)
  $portPattern = [regex]::Escape(":$Port") + "\s+.*LISTENING\s+(\d+)"
  $conns = netstat -aon | Select-String $portPattern | ForEach-Object {
    if ($_.Matches.Count -gt 0) { $_.Matches[0].Groups[1].Value }
  } | Select-Object -Unique
  foreach ($pid in $conns) {
    try {
      Write-Host "Stopping PID $pid"
      Stop-Process -Id $pid -Force -ErrorAction Stop
    } catch {
      Write-Warning "Failed to stop PID $pid: $_"
    }
  }
}

# Start backend
Write-Host "Starting XTTS backend..."
$cmd = "uvicorn api.tts_server:app --port $Port --host $Host"
Write-Host $cmd
& powershell -NoExit -Command $cmd
