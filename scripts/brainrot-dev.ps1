param(
  [switch]$NoColor = $false,
  [int]$TtsPort = 8000,
  [string]$TtsHost = "127.0.0.1",
  [int]$WebPort = 3000,
  [string]$WebHost = "localhost"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $root "..")
$webRoot = Join-Path $repoRoot "web"

# ANSI color codes
$reset = if ($NoColor) { "" } else { "`e[0m" }
$bold = if ($NoColor) { "" } else { "`e[1m" }
$cyan = if ($NoColor) { "" } else { "`e[36m" }
$green = if ($NoColor) { "" } else { "`e[32m" }
$yellow = if ($NoColor) { "" } else { "`e[33m" }
$red = if ($NoColor) { "" } else { "`e[31m" }
$magenta = if ($NoColor) { "" } else { "`e[35m" }
# $blue variable removed as it's not used
$gray = if ($NoColor) { "" } else { "`e[90m" }

function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = $reset
    )
    Write-Host "$Color$Text$reset"
}

function Write-Banner {
    Write-ColorText "╔════════════════════════════════════════════════════════════════╗" $cyan
    Write-ColorText "║                                                                ║" $cyan
    Write-ColorText "║  $bold$magenta B R A I N R O T   S T U D I O   D E V   S E R V E R $reset$cyan  ║" $cyan
    Write-ColorText "║                                                                ║" $cyan
    Write-ColorText "╚════════════════════════════════════════════════════════════════╝" $cyan
    Write-ColorText ""
}

function Stop-ProcessOnPort {
    param (
        [int]$Port
    )
    
    Write-ColorText "🔍 Checking for processes on port $Port..." $yellow
    
    $portPattern = [regex]::Escape(":$Port") + "\s+.*LISTENING\s+(\d+)"
    $conns = netstat -aon | Select-String $portPattern | ForEach-Object {
        if ($_.Matches.Count -gt 0) { $_.Matches[0].Groups[1].Value }
    } | Select-Object -Unique
    
    foreach ($procId in $conns) {
        try {
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
            $processName = if ($process) { $process.ProcessName } else { "Unknown" }
            Write-ColorText "🛑 Stopping $processName (PID $procId) on port $Port" $red
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-ColorText "✅ Process terminated successfully" $green
        } catch {
            # Simple error handling without complex variable references
            Write-ColorText "⚠️ Failed to stop PID $procId" $yellow
        }
    }
    
    if (-not $conns) {
        Write-ColorText "✅ No processes found on port $Port" $green
    }
}

function Initialize-Venv {
    $venvActivate = Join-Path $repoRoot ".venv/Scripts/Activate.ps1"
    if (-Not (Test-Path $venvActivate)) {
        Write-ColorText "❌ Python virtual environment not found at $venvActivate" $red
        Write-ColorText "   Create it with: python -m venv .venv" $yellow
        exit 1
    }
    
    Write-ColorText "🐍 Activating Python virtual environment..." $green
    & $venvActivate
    
    # Check if activation was successful
    if (-not $env:VIRTUAL_ENV) {
        Write-ColorText "❌ Failed to activate virtual environment" $red
        exit 1
    }
    
    Write-ColorText "✅ Virtual environment activated: $env:VIRTUAL_ENV" $green
}

function Start-TtsBackend {
    param (
        [string]$HostName,
        [int]$Port
    )
    
    Write-ColorText "🚀 Starting XTTS backend on ${HostName}:${Port}..." $green
    $env:PYTHONUNBUFFERED = "1"  # Ensure Python output is not buffered
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$repoRoot'; uvicorn api.tts_server:app --port $Port --host $HostName" -NoNewWindow
    
    # Wait a moment for the server to start
    Start-Sleep -Seconds 2
    
    # Check if the server started successfully
    $portPattern = [regex]::Escape(":$Port") + "\s+.*LISTENING\s+(\d+)"
    $conns = netstat -aon | Select-String $portPattern
    
    if ($conns) {
        Write-ColorText "✅ XTTS backend started successfully" $green
        Write-ColorText "   API available at: http://${HostName}:${Port}" $cyan
    } else {
        Write-ColorText "⚠️ XTTS backend may not have started correctly" $yellow
        Write-ColorText "   Check for errors in the terminal window" $yellow
    }
}

function Start-NextjsFrontend {
    param (
        [string]$HostName,
        [int]$Port
    )
    
    Write-ColorText "🚀 Starting Next.js frontend..." $green
    
    # Check if node_modules exists
    if (-Not (Test-Path (Join-Path $webRoot "node_modules"))) {
        Write-ColorText "📦 Installing frontend dependencies..." $yellow
        Push-Location $webRoot
        npm install
        Pop-Location
    }
    
    # Start Next.js
    Push-Location $webRoot
    $env:NEXT_PUBLIC_TTS_BASE = "http://${TtsHost}:${TtsPort}"
    Write-ColorText "🔗 Setting NEXT_PUBLIC_TTS_BASE=$env:NEXT_PUBLIC_TTS_BASE" $cyan
    npm run dev
    Pop-Location
}

# Main script execution
Clear-Host
Write-Banner

Write-ColorText "🧠 Brainrot Studio Development Server" $bold$magenta
Write-ColorText "   Repo root: $repoRoot" $gray
Write-ColorText ""

# Kill processes on ports if they exist
Stop-ProcessOnPort -Port $TtsPort
Stop-ProcessOnPort -Port $WebPort

# Initialize Python virtual environment
Initialize-Venv

# Start TTS backend
Start-TtsBackend -HostName $TtsHost -Port $TtsPort

# Start Next.js frontend (this will take over the terminal)
Write-ColorText ""
Write-ColorText "🌐 Starting Next.js frontend..." $green
Write-ColorText "   Once started, access the app at: http://${WebHost}:${WebPort}/studio" $cyan
Write-ColorText ""
Write-ColorText "📋 Press Ctrl+C to stop both servers" $yellow
Write-ColorText ""

Start-NextjsFrontend -HostName $WebHost -Port $WebPort
