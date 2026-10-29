# DEVAM — Talkdedsec editörü (sıfırdan)

Son güncelleme: 2026-10-29

## Durum
- Temel: VS Code **1.144.0** kaynağı (GitHub tag arşivi), `chore: import` commit'i saf upstream.
- Rename + göz logosu uygulandı (`tlk/rebrand.mjs`). Henüz `npm install` / build yapılmadı.
- Eski fork `D:\tlk-code` (1.130.0, commit'lenmemiş) yalnızca referans; kimlik değerleri oradan alındı.

## Rename kapsamı
- `product.json`: ad, applicationName `talkdedsec`, veri klasörleri, AppId'ler (eski kurulumla aynı), URL'ler.
- exe kaynakları (CompanyName, LegalCopyright), Inno kurulum (yayıncı, URL, `TalkdedsecSetup`), Start menü kutusu.
- İkonlar: win32 ico/png/bmp, linux, darwin icns, server, başlık çubuğu, boş editör filigranı, Agents penceresi, GitHub giriş sayfası.
- UI metinleri: tırnak içindeki "VS Code" / "Visual Studio Code" / "Code - OSS" → "Talkdedsec" (src + yerleşik eklenti nls).

## Bilerek dokunulmayanlar
- Microsoft telif başlıkları ve LICENSE.txt (MIT gereği).
- `vscode` API isim alanı, `vscode://` dışı iç tanımlayıcılar, `package.json` name (`code-oss-dev`, build buna bağlı).
- `extensions/copilot` (Microsoft'un kendi eklentisi), test klasörleri.
- `keepUpstream` listesindeki dosyalar (karşılaştırma yapan ya da gerçek VS Code'u anlatan metinler).
- Dil dosyası ikonları (`resources/win32/*.ico` dil başına), aquarium sürprizindeki VS Code silüeti (`vscodeLogoPath.ts`).

## Sıradaki
- `npm ci` + derleme, açılış testi.
- Telemetri/uç nokta temizliği (`voiceWsUrl`, Copilot uçları), Open VSX galerisi.
