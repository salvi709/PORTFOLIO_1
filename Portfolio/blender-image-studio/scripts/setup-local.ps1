param(
    [string]$PythonPath = "",
    [switch]$CpuOnly
)

$ErrorActionPreference = "Stop"
$PluginRoot = Split-Path -Parent $PSScriptRoot
$VenvPath = Join-Path $PluginRoot ".venv"
$VendorPath = Join-Path $PluginRoot "vendor"
$TripoPath = Join-Path $VendorPath "TripoSR"

if (-not $PythonPath) {
    $PythonPath = (& py -3.11 -c "import sys; print(sys.executable)" 2>$null)
}

if (-not $PythonPath -or -not (Test-Path $PythonPath)) {
    throw "Python 3.11 is required. Install it from python.org, then rerun with -PythonPath C:\path\to\python.exe."
}

& $PythonPath -c "import sys; assert sys.version_info[:2] == (3, 11), 'Python 3.11 is required'"
& $PythonPath -m venv $VenvPath
$VenvPython = Join-Path $VenvPath "Scripts\python.exe"
& $VenvPython -m pip install --upgrade pip setuptools wheel

New-Item -ItemType Directory -Force -Path $VendorPath | Out-Null
if (-not (Test-Path (Join-Path $TripoPath "run.py"))) {
    git clone https://github.com/VAST-AI-Research/TripoSR.git $TripoPath
}

if ($CpuOnly) {
    & $VenvPython -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
} else {
    & $VenvPython -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
}
& $VenvPython -m pip install -r (Join-Path $TripoPath "requirements.txt")
& $VenvPython -m pip install "git+https://github.com/tatsy/torchmcubes.git"

$Config = @{
    blenderPath = "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
    pythonPath = ".venv\Scripts\python.exe"
    triposrRoot = "vendor\TripoSR"
} | ConvertTo-Json
$Config | Set-Content -Encoding UTF8 (Join-Path $PluginRoot "config.json")

Write-Host "Setup complete. TripoSR model weights download automatically on the first generation."
