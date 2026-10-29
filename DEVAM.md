# DEVAM — Talkdedsec editörü (sıfırdan)

Son güncelleme: 2026-10-29

## Durum
- Temel: VS Code **1.144.0** kaynağı (GitHub tag arşivi), `chore: import` commit'i saf upstream.
- Repo: `github.com/Talkdedsec/talkdedsec-code` (public). Site: `talkdedsec.github.io/talkdedsec-code/` (Pages, `site/`).
- Derlendi, kuruldu, ölçüldü (aşağıda). Release etiketi uygulama sürümüyle aynı: `v1.144.0`.
- `code.talkdedsec.com` kapatılıyor; tüm adresler github.io / GitHub reposuna döndü. Eski repolar `talkdedseccode` hesabında.
- Eski fork `D:\tlk-code` (1.130.0, commit'lenmemiş) yalnızca referans; kimlik değerleri oradan alındı.

## Upstream güncellemesi
Yeni tarball'ı içe aktar (Talkdedsec commit'i), sonra `node tlk/rebrand.mjs` ve `node tlk/ozellestir.mjs`; ikinci çalıştırma
`0 files changed` demeli. Repo `core.eol=lf` (Windows checkout CRLF yazarsa yamalar tutmaz). `patch()` hedef kaynağı kapsıyorsa
ya da silme ise ayrı ayrı "uygulanmış" kontrolü yapar — bunu bozma, yamalar sessizce atlanıyordu.

## Rename kapsamı (`tlk/rebrand.mjs`)
- `product.json`: ad, applicationName `talkdedsec`, veri klasörleri, AppId'ler (eski kurulumla aynı), GitHub/github.io URL'leri.
- exe kaynakları (CompanyName, LegalCopyright), Inno kurulum (yayıncı, URL, `TalkdedsecSetup`), Start menü kutusu.
- İkonlar: win32 ico/png/bmp, linux, darwin icns, server, başlık çubuğu, boş editör filigranı, Agents penceresi, GitHub giriş sayfası.
- UI metinleri: tırnak içindeki "VS Code" / "Visual Studio Code" / "Code - OSS" → "Talkdedsec" (src + yerleşik eklenti nls).

## Bilerek dokunulmayanlar
- Microsoft telif başlıkları ve LICENSE.txt (MIT gereği; altına Talkdedsec satırı eklenir).
- `vscode` API isim alanı, iç tanımlayıcılar, `package.json` name (`code-oss-dev`, build buna bağlı).
- `extensions/copilot` ve `extensions/vscode-test-resolver` metinleri, test klasörleri, `keepUpstream` listesi.
- Dil dosyası ikonları (`resources/win32/*.ico`), aquarium sürprizindeki VS Code silüeti (`vscodeLogoPath.ts`).

## Özelleştirme (`tlk/ozellestir.mjs`)
- Gizlilik: telemetri varsayılanı `off`, experiments kapalı, `voiceWsUrl` silindi, JSON şema indirme + npm paket sorgusu kapalı,
  chat eklenti pazarı listesi boş, Chromium yazım denetimi + Google'dan sözlük indirme kapalı (her oturumda).
  Ölçüm: açılışta dış bağlantı 0 (önceden redirector.gvt1.com'dan `en-US-10-1.bdic` iniyordu).
- İlk açılıştaki Copilot giriş penceresi (`workbench.welcomePage.experimentalOnboarding`) varsayılan kapalı.
- Eklenti mağazası: Open VSX.
- `extensions/copilot` ve test eklentileri npm kurulumuna ve build'e girmez; source map yok.
- 5 tema (`tlk/themes`), varsayılan Talkdedsec Dark/Light; açılış ön-renkleri tema dosyasından hesaplanır.
- Koyu Inno sihirbazı (`tlk/kurulum-koyu.pas`) + kabuk için ilerleme köprüsü (`/TLKPROGRESS`).
- Türkçe: `extensions/vscode-language-pack-tr` (Open VSX 1.131.0, MIT) gömülü, ürün adı ve Türkçe ekler uyumlu.
  Türkçe Windows'ta argv.json'da locale yoksa Türkçe açılır; yerleşik paket açılışta `languagepacks.json`'a yazılır.
- Repo dosyaları: `.github` tamamen `tlk/repo/github` ile değiştirilir (Pages workflow + görseller), `.agents`/`AGENTS.md` silinir,
  postinstall'daki ajan link bloğu çıkarılır, README/README.tr/SECURITY/CONTRIBUTING `tlk/repo`'dan gelir.

## Kurulum kabuğu (`tlk/kurulum/`)
- C++ Win32 + Direct2D/DirectWrite, WebView2 yok, statik CRT. Inno kurulumu RCDATA olarak gömülü; temp'e açılıp
  `/VERYSILENT /TASKS=… /DIR=… /TLKPROGRESS=<dosya>` ile çalışır. Temiz kurulum ve güncelleme yolu denendi.
- Göz `tlk/logo.png`'den açılışta noktalara çevrilir; imleci izler, göz kırpar, kurulumda yanar, bitince parlar.
- TR/EN: kurulum dili + `~/.talkdedsec/argv.json` "locale". Kullanıcı kendi makinesinde EN seçti; kabuk TR yazarsa geri al.

## Site (`site/`)
- Next 16 statik export, `basePath: /talkdedsec-code`. Kök sayfa dile göre yönlendirir. `scripts/pages-uzanti.mjs` (postbuild)
  uzantısız OG/ikon dosyalarına `.png` kopyası koyar ve adresleri düzeltir (Pages içerik türünü uzantıdan seçiyor).
- Konular Discussions'tan derleme anında çekilir; workflow her gün 04:17 UTC'de yeniden derler.
- Ölçümler (2026-10-29, Win 11 Pro 26300, kurulu üretim sürümü, 3 çalıştırma medyanı): açılış 0,31 sn · 8 süreç · ~1460 MB ·
  0,75 GB kurulu · 187,5 MB kurulum · 94 yerleşik eklenti · 0 source map · açılışta 0 dış bağlantı.

## Site tasarımı (2026-10-29)
- Yön: göz merkezli sinematik; tek vurgu sarı `#FFD600` (`--color-brand`), yalnız CTA, işaretler ve birimlerde.
- Hero tam ekran, satır maskeli başlık (`\n` ile satırlara bölünür), statik göz (`public/logo.png`, klasik göz) WebGL hazır olunca
  `data-eye-live` ile söner; telefonda `eye-mobile`. Ölçümler `numeral`, gizlilik `monument` + kaldırılan adres şeridi (`ticker`).
- Ajan bölümü yalnız kaynakta görünenleri söyler (Claude Agent SDK, Codex, Copilot SDK; hesap bağlanmadan çalışmaz).
- favicon/icon/apple-icon klasik gözden (`lib/eye-icon.tsx`). Alt sayfa başlıkları `page-title` / `page-title-sm`.
- İndirme zinciri test edildi: buton → releases/latest/download → v1.144.0 → CDN, SHA-256 aynı, sayaç arttı.

## Bekleyenler
- Sosyal önizleme: `Desktop\Medya\og-images\talkdedsec-code.png` → repo Settings > Social preview (API yok, elle).
- `code.talkdedsec.com` kapatma (onaylandı, yapılmadı): Cloudflare'de proxied A/AAAA, kaynak büyük ihtimalle vps-pro nginx.
- `talkdedseccode` repolarını arşivleme/yönlendirme: o hesapla `gh auth login` gerekiyor.
- Dependabot 30 uyarı (upstream bağımlılıkları), elle güncellenecek.

## Görseller
- `powershell -ExecutionPolicy Bypass -File tlk/repo/gorsel.ps1`: editör + kurulum ekran görüntüsü (yalnız kendi penceresi, PrintWindow),
  README banner'ı, sosyal önizleme `Desktop\Medya\og-images\talkdedsec-code.png` (Settings > Social preview'a elle yüklenir).

## Bilinen eksikler
- İlk açılış rehberi ("Use AI features with Copilot for free") ve sohbet paneli hâlâ Copilot'a yönlendiriyor; Copilot paketlenmediği için kırık.
- Dil paketi 1.131 çevirisi; 1.144'te yeni gelen metinler İngilizce kalır.
- Kurulum imzasız; SmartScreen bir kez sorar.
