# Setup plan script (PowerShell version)

param(
    [switch]$Json
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptDir "common.ps1")

$paths = Get-FeaturePaths
$REPO_ROOT = $paths.REPO_ROOT
$CURRENT_BRANCH = $paths.CURRENT_BRANCH
$HAS_GIT = $paths.HAS_GIT
$FEATURE_DIR = $paths.FEATURE_DIR
$FEATURE_SPEC = $paths.FEATURE_SPEC
$IMPL_PLAN = $paths.IMPL_PLAN

if (-not (Confirm-FeatureBranch $CURRENT_BRANCH $HAS_GIT)) { exit 1 }

if (-not (Test-Path $FEATURE_DIR)) {
    New-Item -ItemType Directory -Path $FEATURE_DIR -Force | Out-Null
}

$template = Join-Path $REPO_ROOT ".specify\templates\emplates\plan-template.md"
if (Test-Path $template -PathType Leaf) {
    Copy-Item -Path $template -Destination $IMPL_PLAN -Force
    if (-not $Json) { Write-Host "Copied plan template to $IMPL_PLAN" }
} else {
    Write-Warning "Plan template not found at $template"
    if (-not (Test-Path $IMPL_PLAN)) {
        New-Item -ItemType File -Path $IMPL_PLAN -Force | Out-Null
    }
}

if ($Json) {
    $out = @{
        FEATURE_SPEC = $FEATURE_SPEC
        IMPL_PLAN    = $IMPL_PLAN
        SPECS_DIR    = $FEATURE_DIR
        BRANCH       = $CURRENT_BRANCH
        HAS_GIT      = $HAS_GIT
    }
    $out | ConvertTo-Json -Compress
} else {
    Write-Host "FEATURE_SPEC: $FEATURE_SPEC"
    Write-Host "IMPL_PLAN: $IMPL_PLAN"
    Write-Host "SPECS_DIR: $FEATURE_DIR"
    Write-Host "BRANCH: $CURRENT_BRANCH"
    Write-Host "HAS_GIT: $HAS_GIT"
}
