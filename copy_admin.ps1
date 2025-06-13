# Script pour copier les fichiers du dossier admin vers client/src/admin
$sourceDir = "$PSScriptRoot\admin\src\"
$destDir = "$PSScriptRoot\client\src\admin\"

# Créer les répertoires s'ils n'existent pas
$dirs = @(
    "components",
    "contexts",
    "hooks",
    "pages",
    "utils",
    "api",
    "types"
)

foreach ($dir in $dirs) {
    $path = Join-Path -Path $destDir -ChildPath $dir
    if (-not (Test-Path -Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Créé: $path"
    }
}

# Copier les fichiers
$excludeDirs = @("node_modules", ".git", ".next", "build", "dist")

Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceDir.Length)
    $targetPath = Join-Path -Path $destDir -ChildPath $relativePath
    
    $shouldCopy = $true
    foreach ($exclude in $excludeDirs) {
        if ($relativePath -match [regex]::Escape($exclude)) {
            $shouldCopy = $false
            break
        }
    }
    
    if ($shouldCopy) {
        $targetDir = [System.IO.Path]::GetDirectoryName($targetPath)
        if (-not (Test-Path -Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
        Write-Host "Copié: $relativePath"
    }
}

Write-Host "Copie terminée !" -ForegroundColor Green
