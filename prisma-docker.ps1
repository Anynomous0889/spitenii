# Helper script to run Prisma commands through Docker
# Usage: .\prisma-docker.ps1 migrate dev --name init
#        .\prisma-docker.ps1 generate
#        .\prisma-docker.ps1 studio

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$dockerComposeFile = Join-Path $PSScriptRoot "..\docker-compose.yml"
$backendPath = $PSScriptRoot

Write-Host "Running Prisma $Command through Docker..." -ForegroundColor Cyan

if ($Command -eq "studio") {
    # Prisma Studio needs port mapping
    docker-compose -f $dockerComposeFile run --rm -p 5555:5555 backend sh -c "npx prisma studio --port 5555 --hostname 0.0.0.0"
} else {
    # Other Prisma commands
    $fullCommand = "npx prisma $Command " + ($Args -join " ")
    docker-compose -f $dockerComposeFile run --rm backend sh -c $fullCommand
}
