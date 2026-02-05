# Common functions and variables for all scripts

function Get-RepoRoot {
    if (git rev-parse --show-toplevel 2>$null) {
        return (git rev-parse --show-toplevel)
    } else {
        # Fall back to script location for non-git repos
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
        return (Get-Item "$scriptDir\..\..\..").FullName
    }
}

function Get-CurrentBranch {
    # First check if SPECIFY_FEATURE environment variable is set
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }

    # Then check git if available
    if (git rev-parse --abbrev-ref HEAD 2>$null) {
        return (git rev-parse --abbrev-ref HEAD)
    }

    # For non-git repos, try to find the latest feature directory
    $repoRoot = Get-RepoRoot
    $specsDir = Join-Path $repoRoot "specs"

    if (Test-Path $specsDir) {
        $latestFeature = ""
        $highest = 0

        Get-ChildItem $specsDir | Where-Object { $_.PSIsContainer } | ForEach-Object {
            $dirname = $_.Name
            if ($dirname -match '^([0-9]{3})-') {
                $number = [int]$Matches[1]
                if ($number -gt $highest) {
                    $highest = $number
                    $latestFeature = $dirname
                }
            }
        }

        if ($latestFeature) {
            return $latestFeature
        }
    }

    return "main"  # Final fallback
}

function Test-HasGit {
    return [bool](git rev-parse --show-toplevel 2>$null)
}

function Confirm-FeatureBranch {
    param($branch, $hasGitRepo)

    # For non-git repos, we can't enforce branch naming but still provide output
    if ($hasGitRepo -ne $true) {
        Write-Warning "[specify] Warning: Git repository not detected; skipped branch validation"
        return $true
    }

    $dedicatedBranches = @("specifications", "plan", "constitution")
    if ($dedicatedBranches -contains $branch) {
        return $true
    }

    if ($branch -notmatch '^[0-9]{3}-') {
        Write-Error "ERROR: Not on a feature branch. Current branch: $branch"
        Write-Host "Feature branches should be named like: 001-feature-name or one of: $($dedicatedBranches -join ', ')" -ForegroundColor Yellow
        return $false
    }

    return $true
}

function Find-FeatureDirByPrefix {
    param($repoRoot, $branchName)
    $specsDir = Join-Path $repoRoot "specs"

    # Extract numeric prefix from branch (e.g., "004" from "004-whatever")
    if ($branchName -notmatch '^([0-9]{3})-') {
        # If branch doesn't have numeric prefix, fall back to exact match
        return Join-Path $specsDir $branchName
    }

    $prefix = $Matches[1]

    # Search for directories in specs/ that start with this prefix
    $matches = @()
    if (Test-Path $specsDir) {
        $matches = Get-ChildItem $specsDir | Where-Object { $_.PSIsContainer -and $_.Name -like "$prefix-*" }
    }

    # Handle results
    if ($matches.Count -eq 0) {
        return Join-Path $specsDir $branchName
    } elseif ($matches.Count -eq 1) {
        return $matches[0].FullName
    } else {
        $matchNames = ($matches | ForEach-Object { $_.Name }) -join ", "
        Write-Error "ERROR: Multiple spec directories found with prefix '$prefix': $matchNames"
        Write-Host "Please ensure only one spec directory exists per numeric prefix." -ForegroundColor Yellow
        return Join-Path $specsDir $branchName
    }
}

function Get-FeaturePaths {
    $repoRoot = Get-RepoRoot
    $currentBranch = Get-CurrentBranch
    $hasGitRepo = Test-HasGit

    # Use prefix-based lookup to support multiple branches per spec
    $featureDir = Find-FeatureDirByPrefix $repoRoot $currentBranch

    return @{
        REPO_ROOT      = $repoRoot
        CURRENT_BRANCH = $currentBranch
        HAS_GIT        = $hasGitRepo
        FEATURE_DIR    = $featureDir
        FEATURE_SPEC   = Join-Path $featureDir "spec.md"
        IMPL_PLAN      = Join-Path $featureDir "plan.md"
        TASKS          = Join-Path $featureDir "tasks.md"
        RESEARCH       = Join-Path $featureDir "research.md"
        DATA_MODEL     = Join-Path $featureDir "data-model.md"
        QUICKSTART     = Join-Path $featureDir "quickstart.md"
        CONTRACTS_DIR  = Join-Path $featureDir "contracts"
    }
}

function Show-FileStatus {
    param($path, $label)
    if (Test-Path $path -PathType Leaf) {
        Write-Host "  ✓ $label" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $label" -ForegroundColor Red
    }
}

function Show-DirStatus {
    param($path, $label)
    if (Test-Path $path -PathType Container -and (Get-ChildItem $path).Count -gt 0) {
        Write-Host "  ✓ $label" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $label" -ForegroundColor Red
    }
}
