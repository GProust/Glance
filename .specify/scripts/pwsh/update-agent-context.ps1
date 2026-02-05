# Update agent context script (PowerShell version)

param(
    [string]$AgentType
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptDir "common.ps1")

$paths = Get-FeaturePaths
$REPO_ROOT = $paths.REPO_ROOT
$CURRENT_BRANCH = $paths.CURRENT_BRANCH
$IMPL_PLAN = $paths.IMPL_PLAN

if (-not $CURRENT_BRANCH) {
    Write-Error "Unable to determine current feature"
    exit 1
}

if (-not (Test-Path $IMPL_PLAN)) {
    Write-Error "No plan.md found at $IMPL_PLAN"
    exit 1
}

function Extract-PlanField {
    param($field, $file)
    $line = Get-Content $file | Where-Object { $_ -match "^\*\*$field\*\*: (.*)" } | Select-Object -First 1
    if ($line -match "^\*\*$field\*\*: (.*)") {
        $val = $Matches[1].Trim()
        if ($val -eq "N/A" -or $val -match "NEEDS CLARIFICATION") { return "" }
        return $val
    }
    return ""
}

$newLang = Extract-PlanField "Language/Version" $IMPL_PLAN
$newFramework = Extract-PlanField "Primary Dependencies" $IMPL_PLAN
$newDb = Extract-PlanField "Storage" $IMPL_PLAN
$newProjectType = Extract-PlanField "Project Type" $IMPL_PLAN

$techStack = @($newLang, $newFramework) | Where-Object { $_ } | Join-String -Separator " + "

function Update-AgentFile {
    param($path, $name)
    if (-not (Test-Path $path)) {
        $template = Join-Path $REPO_ROOT ".specify	emplates\agent-file-template.md"
        if (Test-Path $template) {
            $content = Get-Content $template -Raw
            $content = $content -replace '\[PROJECT NAME\]', (Split-Path $REPO_ROOT -Leaf)
            $content = $content -replace '\[DATE\]', (Get-Date -Format "yyyy-MM-dd")
            $content = $content -replace '\[EXTRACTED FROM ALL PLAN.MD FILES\]', "- $techStack ($CURRENT_BRANCH)"
            $content = $content -replace '\[LAST 3 FEATURES AND WHAT THEY ADDED\]', "- $CURRENT_BRANCH: Added $techStack"
            
            $dir = Split-Path $path
            if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
            $content | Set-Content $path -Force
            Write-Host "✓ Created new $name context file" -ForegroundColor Green
        }
    } else {
        $content = Get-Content $path
        $newContent = @()
        $date = Get-Date -Format "yyyy-MM-dd"
        
        $techAdded = $false
        $changeAdded = $false
        
        foreach ($line in $content) {
            $newLine = $line
            if ($line -match "\*\*Last updated\*\*:.*[0-9]{4}-[0-9]{2}-[0-9]{2}") {
                $newLine = $line -replace "[0-9]{4}-[0-9]{2}-[0-9]{2}", $date
            }
            
            $newContent += $newLine
            
            if ($line -eq "## Active Technologies" -and -not $techAdded) {
                if ($techStack) { $newContent += "- $techStack ($CURRENT_BRANCH)" }
                if ($newDb -and $newDb -ne "N/A") { $newContent += "- $newDb ($CURRENT_BRANCH)" }
                $techAdded = $true
            }
            
            if ($line -eq "## Recent Changes" -and -not $changeAdded) {
                if ($techStack) { $newContent += "- $CURRENT_BRANCH: Added $techStack" }
                elseif ($newDb) { $newContent += "- $CURRENT_BRANCH: Added $newDb" }
                $changeAdded = $true
            }
        }
        
        $newContent | Set-Content $path -Force
        Write-Host "✓ Updated existing $name context file" -ForegroundColor Green
    }
}

$agents = @{
    "claude" = Join-Path $REPO_ROOT "CLAUDE.md"
    "gemini" = Join-Path $REPO_ROOT "GEMINI.md"
    "copilot" = Join-Path $REPO_ROOT ".github\agents\copilot-instructions.md"
    "cursor-agent" = Join-Path $REPO_ROOT ".cursorules\specify-rules.mdc"
}

if ($AgentType) {
    if ($agents.ContainsKey($AgentType)) {
        Update-AgentFile $agents[$AgentType] $AgentType
    } else {
        Write-Error "Unknown agent type: $AgentType"
    }
} else {
    foreach ($key in $agents.Keys) {
        if (Test-Path $agents[$key]) {
            Update-AgentFile $agents[$key] $key
        }
    }
}
