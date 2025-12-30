# DMS API Testing Script - PowerShell
Write-Host "`n🚀 DMS API ENDPOINT TESTS`n" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3000/api"
$token = ""
$documentId = ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/health"
    Write-Host "✅ PASS" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 2: Register
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
$time = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$body = @{ email="test$time@example.com"; password="pass123"; firstName="Test"; lastName="User" } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $body -ContentType "application/json"
    $token = $res.token
    Write-Host "✅ PASS - Token: $($token.Substring(0,15))..." -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 3: Login
Write-Host "`n3. Testing Login..." -ForegroundColor Yellow
$body = @{ email="test$time@example.com"; password="pass123" } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ PASS" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 4: Get Current User
Write-Host "`n4. Testing Get Current User..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $res = Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Headers $headers
    Write-Host "✅ PASS - User: $($res.user.firstName) $($res.user.lastName)" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 5: Upload Document
Write-Host "`n5. Testing Document Upload..." -ForegroundColor Yellow
try {
    "Test content" | Out-File -FilePath "test.txt"
    $headers = @{ Authorization = "Bearer $token" }
    $form = @{ file = Get-Item "test.txt"; title = "Test Doc"; description = "Test"; tags = "test" }
    $res = Invoke-RestMethod -Uri "$BASE_URL/documents" -Method POST -Headers $headers -Form $form
    $documentId = $res.document.id
    Write-Host "✅ PASS - Document ID: $documentId" -ForegroundColor Green
    Remove-Item "test.txt" -ErrorAction SilentlyContinue
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
    Remove-Item "test.txt" -ErrorAction SilentlyContinue
}

# Test 6: List Documents
Write-Host "`n6. Testing List Documents..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $res = Invoke-RestMethod -Uri "$BASE_URL/documents" -Headers $headers
    Write-Host "✅ PASS - Found: $($res.documents.Count) documents" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 7: Search Documents
Write-Host "`n7. Testing Search Documents..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $res = Invoke-RestMethod -Uri "$BASE_URL/documents?q=test" -Headers $headers
    Write-Host "✅ PASS - Results: $($res.documents.Count)" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Test 8: Get Tags
Write-Host "`n8. Testing Get Tags..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $res = Invoke-RestMethod -Uri "$BASE_URL/tags" -Headers $headers
    Write-Host "✅ PASS - Tags: $($res.tags.Count)" -ForegroundColor Green
} catch { Write-Host "❌ FAIL: $_" -ForegroundColor Red }

# Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "`n✅ ALL TESTS COMPLETE!`n" -ForegroundColor Green
Write-Host "Full API Documentation:" -ForegroundColor Cyan
Write-Host "http://localhost:3000/api-docs" -ForegroundColor Yellow
Write-Host ""
