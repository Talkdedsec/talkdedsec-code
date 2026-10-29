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

## Özelleştirme (`tlk/ozellestir.mjs`)
- Gizlilik: telemetri varsayılanı `off`, experiments kapalı, `voiceWsUrl` silindi, JSON şema indirme + npm paket sorgusu kapalı,
  chat eklenti pazarı listesi boş (raw.githubusercontent isteği yok).
- Eklenti mağazası: Open VSX (eski fork'taki çalışan blok).
- `extensions/copilot` npm kurulumuna ve build'e girmez; core'daki Copilot SDK / agent host duruyor.
- Test eklentileri (api-tests, colorize, test-resolver) kurulum ve derleme listesinden çıktı.
- Source map pakete girmez (`stripSourceMapsInPackagingTasks = true`).
- 5 tema (`tlk/themes`), varsayılan Talkdedsec Dark/Light; açılış ön-renkleri tema dosyasından hesaplanır.
- Koyu kurulum sihirbazı: `tlk/kurulum-koyu.pas` code.iss sonuna eklenir.
- Türkçe: `extensions/vscode-language-pack-tr` (Open VSX 1.131.0, MIT) gömülü; çevirilerde ürün adı Talkdedsec, Türkçe ekler
  uyumlu ("Talkdedsec'in"). Yerleşik paket `languagepacks.json`'a girsin diye `NativeLanguagePackService` açılışta `update()` çağırıyor.
  Dil işletim sistemi diline göre seçilir (Türkçe Windows → Türkçe).

## Doğrulanmamış (build yok)
- Türkçe ilk açılışta değil, ikinci açılıştan itibaren gelir (paket listesi paylaşımlı süreçte yazılıyor) — build sonrası kontrol et.
- Dil paketi 1.131 çevirisi; 1.144'te yeni gelen metinler İngilizce kalır.
- Chat paneli hâlâ Copilot kurulumu önerebilir (`defaultChatAgent` silinemez, workbench çöküyor).

## Sıradaki
- `npm ci` + derleme, açılış testi (tema, Türkçe, Open VSX, kurulum sihirbazı).
