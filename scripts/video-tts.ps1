# Read Chinese text from a UTF-8 file and synthesize a wav voice.
param(
  [string]$TextPath,
  [string]$WavPath
)

$text = Get-Content -Raw -Encoding UTF8 -LiteralPath $TextPath
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$chosen = $null

foreach ($v in $s.GetInstalledVoices()) {
  if ($v.VoiceInfo -and $v.VoiceInfo.Culture -and $v.VoiceInfo.Culture.Name -like 'zh*') {
    $chosen = $v.VoiceInfo.Name
    break
  }
}

if ($chosen) { $s.SelectVoice($chosen) }
$s.Rate = 0
$s.SetOutputToWaveFile($WavPath)
$s.Speak($text)
$s.Dispose()