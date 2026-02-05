# Consolidated prerequisite checking script (PowerShell version)

param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly
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
$TASKS = $paths.TASKS

if (-not (Confirm-FeatureBranch $CURRENT_BRANCH $HAS_GIT)) { exit 1 }

if ($PathsOnly) {
    if ($Json) {
        $out = @{
            REPO_ROOT    = $REPO_ROOT
            BRANCH       = $CURRENT_BRANCH
            FEATURE_DIR  = $FEATURE_DIR
            FEATURE_SPEC = $FEATURE_SPEC
            IMPL_PLAN    = $IMPL_PLAN
            TASKS        = $TASKS
        }
        $out | ConvertTo-Json -Compress
    } else {
        Write-Host "REPO_ROOT: $REPO_ROOT"
        Write-Host "BRANCH: $CURRENT_BRANCH"
        Write-Host "FEATURE_DIR: $FEATURE_DIR"
        Write-Host "FEATURE_SPEC: $FEATURE_SPEC"
        Write-Host "IMPL_PLAN: $IMPL_PLAN"
        Write-Host "TASKS: $TASKS"
    }
    exit 0
}

if (-not (Test-Path $FEATURE_DIR -PathType Container)) {
    Write-Error "ERROR: Feature directory not found: $FEATURE_DIR"
    Write-Host "Run /speckit.specify first to create the feature structure." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $IMPL_PLAN -PathType Leaf)) {
    Write-Error "ERROR: plan.md not found in $FEATURE_DIR"
    Write-Host "Run /speckit.plan first to create the implementation plan." -ForegroundColor Yellow
    exit 1
}

if ($RequireTasks -and -not (Test-Path $TASKS -PathType Leaf)) {
    Write-Error "ERROR: tasks.md not found in $FEATURE_DIR"
    Write-Host "Run /speckit.tasks first to create the task list." -ForegroundColor Yellow
    exit 1
}

$docs = @()
if (Test-Path $paths.RESEARCH -PathType Leaf) { $docs += "research.md" }
if (Test-Path $paths.DATA_MODEL -PathType Leaf) { $docs += "data-model.md" }
if (Test-Path $paths.CONTRACTS_DIR -PathType Container -and (Get-ChildItem $paths.CONTRACTS_DIR).Count -gt 0) { $docs += "contracts/" }
if (Test-Path $paths.QUICKSTART -PathType Leaf) { $docs += "quickstart.md" }
if ($IncludeTasks -and (Test-Path $TASKS -PathType Leaf)) { $docs += "tasks.md" }

if ($Json) {
    $out = @{
        FEATURE_DIR    = $FEATURE_DIR
        AVAILABLE_DOCS = $docs
    }
    $out | ConvertTo-Json -Compress
} else {
    Write-Host "FEATURE_DIR:$FEATURE_DIR"
    Write-Host "AVAILABLE_DOCS:"
    Show-FileStatus $paths.RESEARCH "research.md"
    Show-FileStatus $paths.DATA_MODEL "data-model.md"
    Show-DirStatus $paths.CONTRACTS_DIR "contracts/"
    Show-FileStatus $paths.QUICKSTART "quickstart.md"
    if ($IncludeTasks) {
        Show-FileStatus $TASKS "tasks.md"
    }
}
