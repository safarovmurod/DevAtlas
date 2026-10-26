[CmdletBinding()]
param(
    [ValidateSet('checks', 'browser', 'all')][string]$Phase = 'all',
    [switch]$SkipInstall
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $OutputEncoding
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
# Native exit handling is explicit and consistent across Windows PS 5.1 / PS 7.
if (Test-Path Variable:PSNativeCommandUseErrorActionPreference) {
    $PSNativeCommandUseErrorActionPreference = $false
}
. (Join-Path $PSScriptRoot 'lib/native-process.ps1')
$isWindowsHost = [Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT
$diagnosticFile = $null
$transcribing = $false
Push-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
try {
    if ($env:GITHUB_ACTIONS -eq 'true') {
        try {
            $diagnosticFile = [IO.Path]::GetTempFileName()
            Start-Transcript -Path $diagnosticFile -Force | Out-Null
            $transcribing = $true
        } catch {
            $diagnosticFile = $null
        }
    }
    $npmName = if ($isWindowsHost) { 'npm.cmd' } else { 'npm' }
    $npxName = if ($isWindowsHost) { 'npx.cmd' } else { 'npx' }
    $npmBinary = (Get-Command $npmName -CommandType Application -ErrorAction Stop).Source
    $npxBinary = (Get-Command $npxName -CommandType Application -ErrorAction Stop).Source
    $nodeBinary = (Get-Command node -CommandType Application -ErrorAction Stop).Source
    Invoke-CheckedNative -Command $nodeBinary -Arguments @('--version')
    Invoke-CheckedNative -Command $npmBinary -Arguments @('--version')
    if (-not $SkipInstall) { Invoke-CheckedNative -Command $npmBinary -Arguments @('ci') }
    if ($Phase -in @('checks', 'all')) {
        foreach ($report in @('coverage-matrix.mjs', 'delivery-report.mjs')) {
            Invoke-CheckedNative -Command $nodeBinary -Arguments @((Join-Path 'scripts' $report), '--check')
        }
        Invoke-CheckedNative -Command $nodeBinary -Arguments @('scripts/check-short-course-blueprints.mjs')
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'lint')
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'typecheck')
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'test')
        Invoke-CheckedNative -Command $nodeBinary -Arguments @('scripts/run-python-tests.mjs')
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'build')
    }
    if ($Phase -in @('browser', 'all')) {
        if (-not (Test-Path -LiteralPath '/usr/bin/chromium') -and -not $env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
            Invoke-CheckedNative -Command $npxBinary -Arguments @('playwright', 'install', 'chromium')
        }
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'test:e2e')
        Invoke-CheckedNative -Command $npmBinary -Arguments @('run', 'test:auth')
    }
} catch {
    $failureMessage = $_.Exception.Message
    $failureCode = 1
    if ($_.Exception.Data.Contains('NativeExitCode')) { $failureCode = [int]$_.Exception.Data['NativeExitCode'] }
    if ($transcribing) { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null; $transcribing = $false }
    if ($env:GITHUB_ACTIONS -eq 'true') {
        if ($diagnosticFile -and (Test-Path -LiteralPath $diagnosticFile)) {
            $tail = [IO.File]::ReadAllText($diagnosticFile)
            if ($tail.Length -gt 8000) { $tail = $tail.Substring($tail.Length - 8000) }
            $failureMessage = $failureMessage + [Environment]::NewLine + $tail
            if ($env:PLAYWRIGHT_OUTPUT_DIR) {
                [IO.Directory]::CreateDirectory($env:PLAYWRIGHT_OUTPUT_DIR) | Out-Null
                Copy-Item -LiteralPath $diagnosticFile -Destination (Join-Path $env:PLAYWRIGHT_OUTPUT_DIR "powershell-$Phase-failure.log")
            }
        }
        $annotation = $failureMessage.Replace('%', '%25').Replace("`r", '%0D').Replace("`n", '%0A')
        Write-Host "::error title=PowerShell validation::$annotation"
    }
    [Console]::Error.WriteLine($failureMessage)
    exit $failureCode
} finally {
    if ($transcribing) { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null }
    if ($diagnosticFile) { Remove-Item -LiteralPath $diagnosticFile -Force -ErrorAction SilentlyContinue }
    Pop-Location
}
