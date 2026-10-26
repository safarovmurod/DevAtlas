function Invoke-CheckedNative {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string[]]$Arguments = @()
    )
    & $Command @Arguments
    $nativeExitCode = $LASTEXITCODE
    if ($nativeExitCode -ne 0) {
        $failure = New-Object System.Exception("Native command failed with exit code ${nativeExitCode}: $Command")
        $failure.Data['NativeExitCode'] = $nativeExitCode
        throw $failure
    }
}
