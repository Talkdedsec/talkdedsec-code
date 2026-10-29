<p align="center">
  <img src=".github/assets/banner.png" alt="Talkdedsec — sana ait bir kod editörü" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Talkdedsec/talkdedsec-code/releases/latest"><img src="https://img.shields.io/github/v/release/Talkdedsec/talkdedsec-code?style=flat-square&color=FFD600&labelColor=1a1a1a" alt="Son sürüm"></a>
  <a href="LICENSE.txt"><img src="https://img.shields.io/badge/lisans-MIT-FFD600?style=flat-square&labelColor=1a1a1a" alt="MIT lisansı"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20x64-FFD600?style=flat-square&labelColor=1a1a1a" alt="Windows x64">
  <a href="https://talkdedsec.github.io/talkdedsec-code/"><img src="https://img.shields.io/badge/site-talkdedsec.github.io-FFD600?style=flat-square&labelColor=1a1a1a" alt="Web sitesi"></a>
</p>

<p align="center"><a href="README.md">English</a> · <b>Türkçe</b> · <a href="https://talkdedsec.com">talkdedsec.com</a></p>

**Talkdedsec**, açık kaynak VS Code çekirdeği üzerine kurulmuş, telemetrisiz bir Windows kod editörü. Bildiğin editör; veri toplamadan, kendi temalarıyla, Türkçe arayüzüyle ve ürünün parçası gibi hissettiren bir kurulumla.

<p align="center">
  <img src=".github/assets/editor.png" alt="Talkdedsec Dark temasıyla Talkdedsec editörü" width="100%">
</p>

## Farkı ne

- **Varsayılan olarak telemetri yok.** Telemetri ve deneyler kutudan çıktığı gibi kapalı. Ses servisi, JSON şema indirme, npm paket sorgusu ve sohbet eklenti listesi kendi kendine dışarı istek atmıyor.
- **Open VSX.** Eklentiler [open-vsx.org](https://open-vsx.org)'dan gelir.
- **Beş tema.** Talkdedsec Dark, Midnight, Matrix, Ember ve Light. Editör kromu, paneller, git işaretleri ve terminal birlikte döner.
- **Türkçe ve İngilizce.** Türkçe dil paketi içinde gelir; Türkçe Windows'ta Türkçe açılır, ürün adı her metinde tutarlıdır.
- **Hafif paket.** Gömülü Copilot eklentisi, test eklentileri ve source map yok.
- **Kendi kurulumu.** Sessiz Inno Setup'ın önünde yerel bir Direct2D penceresi: noktalı göz imleci izler, dosyalar yerleştikçe yanar. WebView yok, runtime yok.

<p align="center">
  <img src=".github/assets/setup.png" alt="Talkdedsec kurulumu" width="80%">
</p>

## Kurulum

1. [Son sürümden](https://github.com/Talkdedsec/talkdedsec-code/releases/latest) `TalkdedsecSetup.exe` dosyasını indir.
2. İstersen doğrula: `Get-FileHash TalkdedsecSetup.exe -Algorithm SHA256` sürüm notlarındaki değerle aynı olmalı.
3. Çalıştır. Kullanıcıya özel olarak `%LOCALAPPDATA%\Programs\Talkdedsec` altına kurulur; yönetici yetkisi gerekmez.

Kurulum henüz kod imzalı değil; Windows SmartScreen bir kez sorabilir: **Ek bilgi → Yine de çalıştır**.

## Kaynaktan derleme

Gereksinimler: Windows 10/11 x64, Node.js 24.22.1, Python 3, *C++ ile masaüstü geliştirme* ve *MSVC Spectre-mitigated libs* bileşenleriyle Visual Studio 2022 Build Tools, Windows 10/11 SDK (`signtool` için).

```powershell
npm ci
$env:PATH = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\10.0.26100.0\x64;$env:PATH"
npm run gulp vscode-win32-x64-min
npm run gulp vscode-win32-x64-inno-updater
npm run gulp vscode-win32-x64-user-setup
powershell -ExecutionPolicy Bypass -File tlk/kurulum/derle.ps1   # -> .build/win32-x64/TalkdedsecSetup.exe
```

## Fork nasıl tutuluyor

Upstream VS Code olduğu gibi içe aktarılır; tüm değişiklikler iki idempotent betikte durur. Yeni bir upstream sürümü, yeniden içe aktarma artı iki komut demektir:

| | |
|---|---|
| `node tlk/rebrand.mjs` | Ad, kimlik, `tlk/logo.png`'den ikonlar, arayüz metinlerinde ürün adı |
| `node tlk/ozellestir.mjs` | Gizlilik varsayılanları, Open VSX, temalar, Türkçe arayüz, kurulum köprüsü, repo dosyaları |
| `tlk/kurulum/` | Kurulum kabuğu (C++, Direct2D/DirectWrite) |
| `site/` | GitHub Pages'te yayınlanan web sitesi |

## Lisans

[MIT](LICENSE.txt). VS Code kaynağı © Microsoft Corporation; Talkdedsec değişiklikleri © Talkdedsec. Talkdedsec, Microsoft ile bağlantılı değildir ve Microsoft tarafından onaylanmamıştır; “Visual Studio Code” Microsoft'un ticari markasıdır.

## Güvenlik

Güvenlik açıkları için herkese açık issue açma. [SECURITY.md](SECURITY.md) dosyasına bak.

---

<p align="center"><a href="https://talkdedsec.com">talkdedsec.com</a> · <a href="https://github.com/Talkdedsec">Talkdedsec</a> tarafından yapıldı</p>
