# 逐个切换 FlClash 的 V2EX 策略组，记录访问 https://www.v2ex.com/ 的状态码。
# 先在 FlClash 里打开「开发者模式」，再打开「外部控制器」。
# 密钥填 v2ex-test；留空就加 -Secret ""。测完把开关关掉。
# 用法: .\snippets\v2ex-test.ps1
#       .\snippets\v2ex-test.ps1 -Max 80

param(
  [string]$Controller = "http://127.0.0.1:9090",
  [string]$Secret = "v2ex-test",
  [string]$Group = "V2EX",
  [string]$Proxy = "http://127.0.0.1:7890",
  [int]$Max = 40,
  [int]$TimeoutSec = 12
)

$headers = @{}
if ($Secret) { $headers.Authorization = "Bearer $Secret" }
$groupUri = "$Controller/proxies/" + [uri]::EscapeDataString($Group)

try {
  $info = Invoke-RestMethod -Headers $headers -Uri $groupUri
} catch {
  Write-Error "连不上 $groupUri。确认覆写已套用，并且 9090 在监听。"
  exit 1
}

$original = $info.now
$names = @($info.all) | Where-Object { $_ -and $_ -ne "REJECT" -and $_ -ne $Group } | Select-Object -First $Max
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

function Switch-To([string]$name) {
  Invoke-RestMethod -Method Put -Headers $headers -ContentType "application/json; charset=utf-8" -Uri $groupUri -Body (@{ name = $name } | ConvertTo-Json -Compress) | Out-Null
}

$rows = @()
try {
  foreach ($name in $names) {
    Switch-To $name
    Start-Sleep -Milliseconds 400
    $raw = & curl.exe -sS -D - -o NUL --max-time $TimeoutSec -x $Proxy -A $ua -w "`nCODE:%{http_code}`n" "https://www.v2ex.com/" 2>&1 | Out-String
    $code = if ($raw -match "CODE:(\d+)") { $Matches[1] } else { "ERR" }
    $colo = if ($raw -match "CF-RAY:\s*\S+-([A-Za-z0-9]+)") { $Matches[1] } else { "-" }
    $rows += [pscustomobject]@{ Node = $name; Status = $code; Colo = $colo }
    Write-Output ("{0}`t{1}`t{2}" -f $code, $colo, $name)
  }
} finally {
  if ($original) {
    Switch-To $original
    Write-Output "restored: $original"
  }
}

$rows | Format-Table -AutoSize
