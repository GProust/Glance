# Create new feature script (PowerShell version)

param(
    [switch]$Json,
    [string]$ShortName,
    [int]$Number,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$DescriptionParts
)

$featureDescription = $DescriptionParts -join " "

if (-not $featureDescription) {
    Write-Error "Error: Feature description is required."
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptDir "common.ps1")

$repoRoot = Get-RepoRoot
$specsDir = Join-Path $repoRoot "specs"

if (-not (Test-Path $specsDir)) {
    New-Item -ItemType Directory -Path $specsDir -Force | Out-Null
}

function Get-HighestNumber {
    $highest = 0
    
    # Check specs directory
    if (Test-Path $specsDir) {
        Get-ChildItem $specsDir | Where-Object { $_.PSIsContainer } | ForEach-Object {
            if ($_.Name -match '^([0-9]+)') {
                $num = [int]$Matches[1]
                if ($num -gt $highest) { $highest = $num }
            }
        }
    }
    
    # Check git branches
    if (Test-HasGit) {
        git branch -a | ForEach-Object {
            $branch = $_.Trim().Replace("* ", "").Replace("remotes/origin/", "")
            if ($branch -match '^([0-9]{3})-') {
                $num = [int]$Matches[1]
                if ($num -gt $highest) { $highest = $num }
            }
        }
    }
    
    return $highest
}

function Clean-BranchName {
    param($name)
    $clean = $name.ToLower()
    $clean = $clean -replace '[^a-z0-9]', '-'
    $clean = $clean -replace '-+', '-'
    $clean = $clean -replace '^-|-$', ''
    return $clean
}

function Generate-BranchName {
    param($desc)
    $stopWords = "i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set"
    $clean = $desc.ToLower() -replace '[^a-z0-9]', ' '
    $words = $clean.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    
    $meaningful = @()
    foreach ($word in $words) {
        if ($word -notmatch "^($stopWords)$") {
            if ($word.Length -ge 3) {
                $meaningful += $word
            }
        }
    }
    
    if ($meaningful.Count -gt 0) {
        return ($meaningful | Select-Object -First 4) -join "-"
    } else {
        return (Clean-BranchName $desc).Split('-') | Select-Object -First 3 | Join-String -Separator "-"
    }
}

$branchSuffix = ""
if ($ShortName) {
    $branchSuffix = Clean-BranchName $ShortName
} else {
    $branchSuffix = Generate-BranchName $featureDescription
}

if (-not $Number) {
    $Number = (Get-HighestNumber) + 1
}

$featureNum = "{0:D3}" -f $Number
$branchName = "$featureNum-$branchSuffix"

# Limit branch name length
if ($branchName.Length -gt 244) {
    $branchName = $branchName.Substring(0, 244).TrimEnd('-')
}

if (Test-HasGit) {
    git checkout -b $branchName
} else {
    Write-Warning "[specify] Warning: Git repository not detected; skipped branch creation"
}

$featureDir = Join-Path $specsDir $branchName
New-Item -ItemType Directory -Path $featureDir -Force | Out-Null

$template = Join-Path $repoRoot ".specify	emplates\spec-template.md"
$specFile = Join-Path $featureDir "spec.md"

if (Test-Path $template) {
    Copy-Item -Path $template -Destination $specFile -Force
} else {
    New-Item -ItemType File -Path $specFile -Force | Out-Null
}

$env:SPECIFY_FEATURE = $branchName

if ($Json) {
    $out = @{
        BRANCH_NAME = $branchName
        SPEC_FILE   = $specFile
        FEATURE_NUM = $featureNum
    }
    $out | ConvertTo-Json -Compress
} else {
    Write-Host "BRANCH_NAME: $branchName"
    Write-Host "SPEC_FILE: $specFile"
    Write-Host "FEATURE_NUM: $featureNum"
    Write-Host "SPECIFY_FEATURE environment variable set to: $branchName"
}
