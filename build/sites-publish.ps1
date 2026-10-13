# Run the official Sites workflow with Git Bash on this Windows host.
# The workflow itself prompts for JSON on hidden stdin. Never put credentials in this file.
$ErrorActionPreference = 'Stop'
$env:PATH = 'C:\Program Files\Git\bin;' + $env:PATH
$env:TAR_OPTIONS = '--force-local'
Push-Location (Join-Path $PSScriptRoot '..\sites\geography-explorer')
try {
    & node 'C:\Users\yaoja\.codex\plugins\cache\openai-curated-remote\sites\1.0.0\scripts\site-workflow.mjs' --project-id 'appgprj_6accc17b43ac8191bbb8f6a76f4ad37b'
    if ($LASTEXITCODE -ne 0) { throw 'Sites workflow failed.' }
} finally {
    Pop-Location
}
