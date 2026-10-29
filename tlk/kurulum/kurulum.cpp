// Talkdedsec setup shell: a Direct2D window in front of the silent Inno installer.
// The eye is sampled from the classic logo (embedded) at startup; nothing is drawn by hand.
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <windowsx.h>
#include <d2d1_1.h>
#include <dwrite_1.h>
#include <wincodec.h>
#include <dwmapi.h>
#include <shobjidl.h>
#include <shlobj.h>
#include <shellapi.h>
#include <shellscalingapi.h>
#include <algorithm>
#include <atomic>
#include <cmath>
#include <map>
#include <random>
#include <string>
#include <thread>
#include <vector>

#ifndef TLK_VERSION
#define TLK_VERSION L"0.0.0"
#endif

constexpr int IDR_LOGO = 101;
constexpr int IDR_CORE = 102;
constexpr UINT WM_APP_PROGRESS = WM_APP + 1;
constexpr UINT WM_APP_DONE = WM_APP + 2;
constexpr float W = 960, H = 600;
constexpr wchar_t APP_ID_KEY[] = L"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{650CD737-137F-4A90-A9F1-3611329F5D49}_is1";

template <class T> void Release(T*& p) { if (p) { p->Release(); p = nullptr; } }
static float Clamp01(float v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
static float EaseOut(float t) { t = Clamp01(t); return 1 - std::pow(1 - t, 3.f); }
static float EaseOutExpo(float t) { t = Clamp01(t); return t >= 1 ? 1 : 1 - std::pow(2.f, -10 * t); }
static float Smooth(float cur, float target, float dt, float speed) { return cur + (target - cur) * (1 - std::exp(-speed * dt)); }
static D2D1_COLOR_F Hex(UINT rgb, float a = 1) { return D2D1::ColorF(rgb, a); }

// ---- copy -----------------------------------------------------------------------------------------

enum Lang { TR, EN };
struct Str { const wchar_t* tr; const wchar_t* en; };
static Lang g_lang = TR;
static const wchar_t* T(const Str& s) { return g_lang == TR ? s.tr : s.en; }

namespace txt {
const Str eyebrowInstall{ L"KURULUM", L"SETUP" };
const Str eyebrowUpdate{ L"GÜNCELLEME", L"UPDATE" };
const Str headline{ L"Sana ait bir\nkod editörü.", L"A code editor\nthat answers to you." };
const Str lead{ L"Telemetri yok. Sade bir çekirdek, gömülü bir ajan.\nSenin makinen, senin kuralların.", L"No telemetry. A lean core, a built-in agent.\nYour machine, your rules." };
const Str install{ L"Kur", L"Install" };
const Str update{ L"Güncelle", L"Update" };
const Str options{ L"Seçenekler", L"Options" };
const Str location{ L"KONUM", L"LOCATION" };
const Str updateNote{ L"Mevcut kurulum yerinde güncellenecek, ayarların korunur.", L"The existing install is updated in place; your settings stay." };
const Str change{ L"Değiştir", L"Change" };
const Str back{ L"Geri", L"Back" };
const Str optDesktop{ L"Masaüstü kısayolu", L"Desktop shortcut" };
const Str optDesktopD{ L"Masaüstüne bir Talkdedsec simgesi koyar.", L"Puts a Talkdedsec icon on your desktop." };
const Str optPath{ L"PATH'e ekle", L"Add to PATH" };
const Str optPathD{ L"Terminalden “talkdedsec .” ile aç.", L"Open from a terminal with “talkdedsec .”." };
const Str optContext{ L"Sağ tık menüsü", L"Context menu" };
const Str optContextD{ L"Dosya ve klasörlerde “Talkdedsec ile aç”.", L"“Open with Talkdedsec” on files and folders." };
const Str optAssoc{ L"Dosya ilişkilendirme", L"File associations" };
const Str optAssocD{ L"Desteklenen dosyalar Talkdedsec ile açılır.", L"Supported files open with Talkdedsec." };
const Str optLaunch{ L"Bitince başlat", L"Launch when done" };
const Str optLaunchD{ L"Kurulum biter bitmez editör açılır.", L"Opens the editor as soon as setup finishes." };
const Str installing{ L"Kuruluyor", L"Installing" };
const Str updating{ L"Güncelleniyor", L"Updating" };
const Str prepare{ L"Hazırlanıyor…", L"Preparing…" };
const Str placing{ L"Dosyalar yerleştiriliyor…", L"Placing files…" };
const Str finishing{ L"Son dokunuşlar…", L"Finishing touches…" };
const Str doneTitle{ L"Hazır.", L"Ready." };
const Str doneLead{ L"Talkdedsec kuruldu. Telemetri kapalı,\nayarlar sende.", L"Talkdedsec is installed. Telemetry is off,\nthe settings are yours." };
const Str open{ L"Talkdedsec'i aç", L"Open Talkdedsec" };
const Str close{ L"Kapat", L"Close" };
const Str running{ L"Talkdedsec şu an açık. Kapatıp tekrar dene.", L"Talkdedsec is running. Close it and try again." };
const Str errorTitle{ L"Kurulum\ntamamlanamadı.", L"Setup didn't\nfinish." };
const Str errorLead{ L"Kurulum %d koduyla durdu. Günlükte ayrıntı var;\ntekrar deneyebilirsin.", L"Setup stopped with code %d. The log has details;\nyou can try again." };
const Str retry{ L"Tekrar dene", L"Try again" };
const Str log{ L"Günlüğü aç", L"Open log" };
}

// ---- state ----------------------------------------------------------------------------------------

enum Page { WELCOME, OPTIONS, INSTALLING, DONE, FAILED };
enum Id { ID_NONE, ID_CLOSE, ID_MIN, ID_TR, ID_EN, ID_INSTALL, ID_OPTIONS, ID_BACK, ID_CHANGE,
	ID_OPT0, ID_OPT1, ID_OPT2, ID_OPT3, ID_OPT4, ID_OPEN, ID_RETRY, ID_LOG, ID_SITE };

struct Item { int id; D2D1_RECT_F r; bool focusable; };
struct Dot { float hx, hy, ink, phase, sx, sy, delay, angle; };

static HWND g_hwnd;
static ID2D1Factory* g_d2d;
static ID2D1HwndRenderTarget* g_rt;
static ID2D1SolidColorBrush* g_brush;
static IDWriteFactory* g_dw;
static std::wstring g_display = L"Segoe UI", g_text = L"Segoe UI";
static std::vector<Dot> g_dots;
static float g_irisX = -0.043f, g_irisY = 0.082f, g_irisR = 0.172f;

static Page g_page = WELCOME, g_exitPage = WELCOME;
static double g_now, g_enterAt, g_exitAt = -10, g_bootAt, g_blinkAt = 4, g_doneAt = -10;
static std::vector<Item> g_items;
static int g_hover = ID_NONE, g_pressed = ID_NONE, g_focus = -1;
static bool g_keyboard;
static std::map<int, float> g_hoverAnim;
static std::map<int, D2D1_POINT_2F> g_magnet;
static D2D1_POINT_2F g_mouse{ -1000, -1000 }, g_gaze{ 0, 0 };
static float g_progress, g_progressShown;
static std::atomic<int> g_permille{ 0 };
static int g_exitCode;
static bool g_runningWarn;
static double g_warnAt = -10;

static bool g_isUpdate;
static std::wstring g_dir, g_logPath;
static bool g_opt[5] = { false, true, true, true, true };
static float g_optAnim[5] = { 0, 1, 1, 1, 1 };

// ---- text -----------------------------------------------------------------------------------------

struct Font { const std::wstring* family; float size; DWRITE_FONT_WEIGHT weight; float spacing; float lineHeight; };
static const Font F_EYEBROW{ &g_text, 11.5f, DWRITE_FONT_WEIGHT_SEMI_BOLD, 2.4f, 0 };
static const Font F_HEAD{ &g_display, 50, DWRITE_FONT_WEIGHT_SEMI_BOLD, -1.2f, 54 };
static const Font F_LEAD{ &g_text, 15, DWRITE_FONT_WEIGHT_NORMAL, 0, 24 };
static const Font F_BTN{ &g_text, 14.5f, DWRITE_FONT_WEIGHT_SEMI_BOLD, 0.1f, 0 };
static const Font F_SMALL{ &g_text, 12.5f, DWRITE_FONT_WEIGHT_NORMAL, 0, 18 };
static const Font F_LABEL{ &g_text, 15, DWRITE_FONT_WEIGHT_SEMI_BOLD, 0, 0 };
static const Font F_DESC{ &g_text, 13, DWRITE_FONT_WEIGHT_NORMAL, 0, 0 };
static const Font F_BIG{ &g_display, 112, DWRITE_FONT_WEIGHT_LIGHT, -4, 0 };
static const Font F_BRAND{ &g_text, 13, DWRITE_FONT_WEIGHT_SEMI_BOLD, 0.6f, 0 };
static const Font F_SEG{ &g_text, 11.5f, DWRITE_FONT_WEIGHT_SEMI_BOLD, 1.2f, 0 };

static IDWriteTextLayout* Layout(const std::wstring& s, const Font& f, float w, float h, DWRITE_TEXT_ALIGNMENT al = DWRITE_TEXT_ALIGNMENT_LEADING, bool tnum = false) {
	IDWriteTextFormat* fmt = nullptr;
	g_dw->CreateTextFormat(f.family->c_str(), nullptr, f.weight, DWRITE_FONT_STYLE_NORMAL, DWRITE_FONT_STRETCH_NORMAL, f.size, L"", &fmt);
	if (!fmt) { return nullptr; }
	fmt->SetTextAlignment(al);
	fmt->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
	if (f.lineHeight > 0) { fmt->SetLineSpacing(DWRITE_LINE_SPACING_METHOD_UNIFORM, f.lineHeight, f.lineHeight * 0.8f); }
	IDWriteTextLayout* layout = nullptr;
	g_dw->CreateTextLayout(s.c_str(), (UINT32)s.size(), fmt, w, h, &layout);
	fmt->Release();
	if (!layout) { return nullptr; }
	DWRITE_TEXT_RANGE all{ 0, (UINT32)s.size() };
	if (f.spacing != 0) {
		IDWriteTextLayout1* l1 = nullptr;
		if (SUCCEEDED(layout->QueryInterface(&l1))) { l1->SetCharacterSpacing(0, f.spacing, 0, all); l1->Release(); }
	}
	if (tnum) {
		IDWriteTypography* typo = nullptr;
		if (SUCCEEDED(g_dw->CreateTypography(&typo))) {
			typo->AddFontFeature({ DWRITE_FONT_FEATURE_TAG_TABULAR_FIGURES, 1 });
			layout->SetTypography(typo, all);
			typo->Release();
		}
	}
	return layout;
}
static float TextWidth(const std::wstring& s, const Font& f) {
	IDWriteTextLayout* l = Layout(s, f, 2000, 200);
	DWRITE_TEXT_METRICS m{};
	if (l) { l->GetMetrics(&m); l->Release(); }
	return m.widthIncludingTrailingWhitespace;
}
static void Text(const std::wstring& s, const Font& f, float x, float y, float w, float h, D2D1_COLOR_F c, float a = 1,
	DWRITE_TEXT_ALIGNMENT al = DWRITE_TEXT_ALIGNMENT_LEADING, bool tnum = false) {
	if (a <= 0.003f) { return; }
	IDWriteTextLayout* l = Layout(s, f, w, h, al, tnum);
	if (!l) { return; }
	c.a *= a;
	g_brush->SetColor(c);
	g_rt->DrawTextLayout({ x, y }, l, g_brush, D2D1_DRAW_TEXT_OPTIONS_NONE);
	l->Release();
}
static std::wstring Fmt(const wchar_t* f, int v) { wchar_t b[256]; swprintf_s(b, f, v); return b; }

// ---- eye from the logo ----------------------------------------------------------------------------

static bool LoadEye() {
	HRSRC res = FindResourceW(nullptr, MAKEINTRESOURCEW(IDR_LOGO), RT_RCDATA);
	if (!res) { return false; }
	auto bytes = (BYTE*)LockResource(LoadResource(nullptr, res));
	DWORD size = SizeofResource(nullptr, res);
	IWICImagingFactory* wic = nullptr;
	IWICStream* stream = nullptr;
	IWICBitmapDecoder* dec = nullptr;
	IWICBitmapFrameDecode* frame = nullptr;
	IWICFormatConverter* conv = nullptr;
	bool ok = SUCCEEDED(CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&wic)))
		&& SUCCEEDED(wic->CreateStream(&stream)) && SUCCEEDED(stream->InitializeFromMemory(bytes, size))
		&& SUCCEEDED(wic->CreateDecoderFromStream(stream, nullptr, WICDecodeMetadataCacheOnDemand, &dec))
		&& SUCCEEDED(dec->GetFrame(0, &frame)) && SUCCEEDED(wic->CreateFormatConverter(&conv))
		&& SUCCEEDED(conv->Initialize(frame, GUID_WICPixelFormat32bppPBGRA, WICBitmapDitherTypeNone, nullptr, 0, WICBitmapPaletteTypeCustom));
	UINT w = 0, h = 0;
	std::vector<BYTE> px;
	if (ok) {
		conv->GetSize(&w, &h);
		px.resize((size_t)w * h * 4);
		ok = SUCCEEDED(conv->CopyPixels(nullptr, w * 4, (UINT)px.size(), px.data()));
	}
	Release(conv); Release(frame); Release(dec); Release(stream); Release(wic);
	if (!ok) { return false; }

	auto alpha = [&](UINT x, UINT y) { return px[((size_t)y * w + x) * 4 + 3]; };
	UINT x0 = w, y0 = h, x1 = 0, y1 = 0;
	for (UINT y = 0; y < h; y++) {
		for (UINT x = 0; x < w; x++) {
			if (alpha(x, y) > 20) { x0 = std::min(x0, x); x1 = std::max(x1, x); y0 = std::min(y0, y); y1 = std::max(y1, y); }
		}
	}
	if (x1 <= x0 || y1 <= y0) { return false; }
	// same halftone grid the site uses: 94 columns, width spans 94/58 units
	const int COLS = 94;
	const float bw = float(x1 - x0 + 1), bh = float(y1 - y0 + 1), cell = bw / COLS, unit = (COLS / 58.f) / bw;
	const int rows = (int)std::ceil(bh / cell);
	std::mt19937 rng(7);
	std::uniform_real_distribution<float> U(0, 1);
	for (int r = 0; r < rows; r++) {
		for (int c = 0; c < COLS; c++) {
			int ax = x0 + int(c * cell), ay = y0 + int(r * cell), bx = std::min<int>(x0 + int((c + 1) * cell), x1 + 1), by = std::min<int>(y0 + int((r + 1) * cell), y1 + 1);
			if (bx <= ax || by <= ay) { continue; }
			double sum = 0;
			for (int y = ay; y < by; y++) { for (int x = ax; x < bx; x++) { sum += alpha(x, y); } }
			float ink = float(sum / ((bx - ax) * (by - ay) * 255.0));
			if (ink < 0.035f) { continue; }
			Dot d{};
			d.hx = ((ax + bx) * 0.5f - (x0 + bw * 0.5f)) * unit;
			d.hy = ((ay + by) * 0.5f - (y0 + bh * 0.5f)) * unit;
			d.ink = std::min(1.f, ink * 1.25f);
			d.phase = U(rng) * 6.2832f;
			float a = U(rng) * 6.2832f, dist = 0.5f + U(rng) * 1.3f;
			d.sx = d.hx + std::cos(a) * dist;
			d.sy = d.hy + std::sin(a) * dist;
			d.delay = std::sqrt(d.hx * d.hx + d.hy * d.hy) * 0.45f + U(rng) * 0.18f;
			float ang = std::atan2(d.hy - g_irisY, d.hx - g_irisX) + 1.5708f;
			if (ang < 0) { ang += 6.2832f; }
			d.angle = ang / 6.2832f;
			g_dots.push_back(d);
		}
	}
	return !g_dots.empty();
}

static void DrawEye(float cx, float cy, float width, float alpha) {
	const float k = width / (94 / 58.f), cellDip = width / 94;
	const double t = g_now - g_bootAt;
	// idle blink every few seconds, plus one on finish
	float blink = 0;
	for (double at : { g_blinkAt, g_doneAt + 0.5 }) {
		double bt = g_now - at;
		if (bt >= 0 && bt < 0.32) { blink = std::max(blink, (float)std::sin(bt / 0.32 * 3.14159)); }
	}
	if (g_now - g_blinkAt > 0.32 && g_page != INSTALLING) { g_blinkAt = g_now + 4 + (rand() % 400) / 100.0; }
	const float breathe = 1 + 0.012f * (float)std::sin(t * 1.3);
	const bool installing = g_page == INSTALLING;
	const float sweep = g_progressShown;
	const float doneGlow = g_page == DONE ? EaseOut(float(g_now - g_doneAt) / 0.9f) : 0;

	for (const Dot& d : g_dots) {
		float in = EaseOutExpo(float(t - 0.15 - d.delay) / 1.1f);
		if (in <= 0) { continue; }
		float x = d.sx + (d.hx - d.sx) * in, y = d.sy + (d.hy - d.sy) * in;
		float ix = x - g_irisX, iy = y - g_irisY;
		float w = std::exp(-(ix * ix + iy * iy) / (g_irisR * g_irisR * 2.2f));
		x += g_gaze.x * 0.05f * w;
		y += g_gaze.y * 0.035f * w;
		y = g_irisY + (y - g_irisY) * (1 - 0.92f * blink * (1 - 0.3f * w));
		float shimmer = 0.86f + 0.14f * (float)std::sin(t * 2.1 + d.phase);
		float lit = 1;
		if (installing) {
			float edge = sweep * 1.04f - d.angle;
			lit = 0.22f + 0.78f * Clamp01(edge * 14);
			shimmer = 0.9f + 0.1f * (float)std::sin(t * 6 + d.angle * 18);
		}
		float a = d.ink * shimmer * lit * in * alpha;
		a = std::min(1.f, a * (1 + 0.35f * doneGlow));
		float r = cellDip * 0.5f * std::sqrt(d.ink) * 1.08f * breathe;
		g_brush->SetColor(Hex(0xC9CDD4, a));
		g_rt->FillEllipse(D2D1::Ellipse({ cx + x * k * breathe, cy + y * k * breathe }, r, r), g_brush);
	}
}

// ---- widgets --------------------------------------------------------------------------------------

static float HoverAmt(int id) { return g_hoverAnim.count(id) ? g_hoverAnim[id] : 0; }
static bool Contains(const D2D1_RECT_F& r, D2D1_POINT_2F p) { return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom; }
static void PushItem(int id, D2D1_RECT_F r, bool focusable = true) { g_items.push_back({ id, r, focusable }); }
static bool Focused(int id) { return g_keyboard && g_focus >= 0 && g_focus < (int)g_items.size() && g_items[g_focus].id == id; }
static void FocusRing(D2D1_RECT_F r, float radius, float a) {
	g_brush->SetColor(Hex(0x8A8F98, 0.9f * a));
	g_rt->DrawRoundedRectangle(D2D1::RoundedRect({ r.left - 4, r.top - 4, r.right + 4, r.bottom + 4 }, radius + 4, radius + 4), g_brush, 1.5f);
}

enum BtnKind { PRIMARY, GHOST, LINK };
static float Button(int id, const std::wstring& label, float x, float y, BtnKind kind, float a, bool interactive = true) {
	const float h = kind == LINK ? 24.f : 46.f, pad = kind == LINK ? 0.f : 26.f;
	float w = TextWidth(label, F_BTN) + pad * 2 + (kind == LINK ? 18 : 0);
	D2D1_RECT_F hit{ x, y, x + w, y + h };
	if (interactive && a > 0.5f) { PushItem(id, hit); }
	float hv = HoverAmt(id);
	D2D1_POINT_2F m = g_magnet.count(id) ? g_magnet[id] : D2D1_POINT_2F{ 0, 0 };
	float press = g_pressed == id ? 1.f : 0.f;
	D2D1_RECT_F r{ x + m.x, y + m.y, x + w + m.x, y + h + m.y };
	float sc = 1 - press * 0.03f;
	D2D1_POINT_2F c{ (r.left + r.right) / 2, (r.top + r.bottom) / 2 };
	g_rt->SetTransform(D2D1::Matrix3x2F::Scale(sc, sc, c));
	if (kind == PRIMARY) {
		D2D1_COLOR_F base = Hex(0xE4E7EC, a), hot = Hex(0xFFFFFF, a);
		g_brush->SetColor({ base.r + (hot.r - base.r) * hv, base.g + (hot.g - base.g) * hv, base.b + (hot.b - base.b) * hv, a });
		g_rt->FillRoundedRectangle(D2D1::RoundedRect(r, h / 2, h / 2), g_brush);
		Text(label, F_BTN, r.left, r.top + 13, w, h, Hex(0x0B0B0C), a, DWRITE_TEXT_ALIGNMENT_CENTER);
	} else if (kind == GHOST) {
		g_brush->SetColor(Hex(0x17181C, a * hv));
		g_rt->FillRoundedRectangle(D2D1::RoundedRect(r, h / 2, h / 2), g_brush);
		g_brush->SetColor(Hex(0x2A2D31, a));
		g_rt->DrawRoundedRectangle(D2D1::RoundedRect({ r.left + .5f, r.top + .5f, r.right - .5f, r.bottom - .5f }, h / 2, h / 2), g_brush, 1);
		Text(label, F_BTN, r.left, r.top + 13, w, h, Hex(0xC9CDD4), a, DWRITE_TEXT_ALIGNMENT_CENTER);
	} else {
		Text(label, F_BTN, r.left, r.top + 2, w, h, Hex(0xC9CDD4), a * (0.75f + 0.25f * hv));
		// arrow slides on hover
		float ax = r.right - 10 + 4 * hv, ay = r.top + 12;
		g_brush->SetColor(Hex(0xC9CDD4, a * (0.75f + 0.25f * hv)));
		g_rt->DrawLine({ ax - 8, ay }, { ax, ay }, g_brush, 1.4f);
		g_rt->DrawLine({ ax - 4, ay - 4 }, { ax, ay }, g_brush, 1.4f);
		g_rt->DrawLine({ ax - 4, ay + 4 }, { ax, ay }, g_brush, 1.4f);
		g_brush->SetColor(Hex(0x6E7681, a * hv));
		g_rt->DrawLine({ r.left, r.bottom - 1 }, { r.left + (w - 18) * hv, r.bottom - 1 }, g_brush, 1);
	}
	g_rt->SetTransform(D2D1::Matrix3x2F::Identity());
	if (Focused(id)) { FocusRing(r, kind == LINK ? 4 : h / 2, a); }
	return w;
}

static void Toggle(int idx, float x, float y, float a) {
	const int id = ID_OPT0 + idx;
	D2D1_RECT_F r{ x, y, x + 44, y + 24 };
	float on = g_optAnim[idx], hv = HoverAmt(id);
	D2D1_COLOR_F off = Hex(0x1C1E22), onc = Hex(0xE4E7EC);
	g_brush->SetColor({ off.r + (onc.r - off.r) * on, off.g + (onc.g - off.g) * on, off.b + (onc.b - off.b) * on, a });
	g_rt->FillRoundedRectangle(D2D1::RoundedRect(r, 12, 12), g_brush);
	g_brush->SetColor(Hex(0x2A2D31, a * (1 - on) * (0.7f + 0.3f * hv)));
	g_rt->DrawRoundedRectangle(D2D1::RoundedRect({ r.left + .5f, r.top + .5f, r.right - .5f, r.bottom - .5f }, 12, 12), g_brush, 1);
	float kx = x + 12 + 20 * EaseOut(on);
	D2D1_COLOR_F koff = Hex(0x6E7681), kon = Hex(0x0B0B0C);
	g_brush->SetColor({ koff.r + (kon.r - koff.r) * on, koff.g + (kon.g - koff.g) * on, koff.b + (kon.b - koff.b) * on, a });
	float kr = 8 + 1.5f * hv;
	g_rt->FillEllipse(D2D1::Ellipse({ kx, y + 12 }, kr, kr), g_brush);
}

// staggered entrance: element i of a page fades and rises in after the page appears
static float Appear(int i, float& dy) {
	float t = float(g_now - g_enterAt) - i * 0.055f;
	float e = EaseOut(t / 0.55f);
	dy = (1 - e) * 16;
	return e;
}

// ---- pages ----------------------------------------------------------------------------------------

constexpr float LX = 64;

static void PageWelcome(float pa, bool live) {
	float dy, a;
	a = Appear(0, dy) * pa;
	Text(std::wstring(T(g_isUpdate ? txt::eyebrowUpdate : txt::eyebrowInstall)) + L"  ·  v" TLK_VERSION, F_EYEBROW, LX, 150 + dy, 400, 20, Hex(0x6E7681), a);
	a = Appear(1, dy) * pa;
	Text(T(txt::headline), F_HEAD, LX - 2, 178 + dy, 520, 130, Hex(0xE4E7EC), a);
	a = Appear(2, dy) * pa;
	Text(T(txt::lead), F_LEAD, LX, 306 + dy, 440, 60, Hex(0x8A8F98), a);
	a = Appear(3, dy) * pa;
	float bw = Button(ID_INSTALL, T(g_isUpdate ? txt::update : txt::install), LX, 392 + dy, PRIMARY, a, live);
	Button(ID_OPTIONS, T(txt::options), LX + bw + 26, 403 + dy, LINK, a, live);

	a = Appear(4, dy) * pa;
	float wa = g_runningWarn ? EaseOut(float(g_now - g_warnAt) / 0.4f) : 0;
	if (wa > 0) {
		g_brush->SetColor(Hex(0xD97A7A, a * wa));
		g_rt->FillEllipse(D2D1::Ellipse({ LX + 4, 466 + dy }, 3, 3), g_brush);
		Text(T(txt::running), F_SMALL, LX + 16, 457 + dy, 460, 20, Hex(0xD9A0A0), a * wa);
	}
	a = Appear(5, dy) * pa;
	Text(T(txt::location), F_EYEBROW, LX, 512 + dy, 200, 20, Hex(0x4A4E55), a);
	Text(g_dir, F_SMALL, LX, 530 + dy, 460, 20, Hex(0x8A8F98), a);
	if (g_isUpdate) { Text(T(txt::updateNote), F_SMALL, LX, 548 + dy, 460, 20, Hex(0x5A5F67), a); }
}

static void PageOptions(float pa, bool live) {
	float dy, a;
	a = Appear(0, dy) * pa;
	Text(T(txt::options), F_HEAD, LX - 2, 84 + dy, 480, 70, Hex(0xE4E7EC), a);
	const Str* labels[5] = { &txt::optDesktop, &txt::optPath, &txt::optContext, &txt::optAssoc, &txt::optLaunch };
	const Str* descs[5] = { &txt::optDesktopD, &txt::optPathD, &txt::optContextD, &txt::optAssocD, &txt::optLaunchD };
	float y = 168;
	for (int i = 0; i < 5; i++, y += 56) {
		a = Appear(1 + i, dy) * pa;
		D2D1_RECT_F row{ LX - 12, y - 8 + dy, LX + 456, y + 44 + dy };
		if (live && a > 0.5f) { PushItem(ID_OPT0 + i, row); }
		g_brush->SetColor(Hex(0x121316, a * HoverAmt(ID_OPT0 + i)));
		g_rt->FillRoundedRectangle(D2D1::RoundedRect(row, 10, 10), g_brush);
		Text(T(*labels[i]), F_LABEL, LX, y + dy, 360, 22, Hex(0xE4E7EC), a);
		Text(T(*descs[i]), F_DESC, LX, y + 21 + dy, 380, 20, Hex(0x6E7681), a);
		Toggle(i, LX + 400, y + 6 + dy, a);
		if (Focused(ID_OPT0 + i)) { FocusRing(row, 10, a); }
	}
	a = Appear(7, dy) * pa;
	Text(T(txt::location), F_EYEBROW, LX, y + 4 + dy, 200, 20, Hex(0x4A4E55), a);
	Text(g_dir, F_SMALL, LX, y + 22 + dy, 340, 20, Hex(0x8A8F98), a);
	Button(ID_CHANGE, T(txt::change), LX + 360, y + 10 + dy, LINK, a, live);
	a = Appear(8, dy) * pa;
	float bw = Button(ID_INSTALL, T(g_isUpdate ? txt::update : txt::install), LX, 524 + dy, PRIMARY, a, live);
	Button(ID_BACK, T(txt::back), LX + bw + 12, 524 + dy, GHOST, a, live);
}

static void PageInstalling(float pa) {
	float dy, a;
	a = Appear(0, dy) * pa;
	Text(std::wstring(T(g_isUpdate ? txt::updating : txt::installing)) + L"  ·  v" TLK_VERSION, F_EYEBROW, LX, 168 + dy, 400, 20, Hex(0x6E7681), a);
	a = Appear(1, dy) * pa;
	int pct = (int)std::floor(g_progressShown * 100 + 0.0001f);
	Text(std::to_wstring(pct), F_BIG, LX - 6, 196 + dy, 400, 140, Hex(0xE4E7EC), a, DWRITE_TEXT_ALIGNMENT_LEADING, true);
	float nw = TextWidth(std::to_wstring(pct), F_BIG);
	Text(L"%", F_HEAD, LX + nw + 2, 222 + dy, 60, 60, Hex(0x4A4E55), a);
	a = Appear(2, dy) * pa;
	const Str& st = g_progressShown < 0.04f ? txt::prepare : g_progressShown < 0.97f ? txt::placing : txt::finishing;
	Text(T(st), F_LEAD, LX, 352 + dy, 440, 30, Hex(0x8A8F98), a);
	// hairline progress with a soft head
	float x0 = LX, x1 = LX + 400, yy = 400 + dy, px = x0 + (x1 - x0) * g_progressShown;
	g_brush->SetColor(Hex(0x1C1E22, a));
	g_rt->DrawLine({ x0, yy }, { x1, yy }, g_brush, 1);
	g_brush->SetColor(Hex(0xE4E7EC, a));
	g_rt->DrawLine({ x0, yy }, { px, yy }, g_brush, 1.5f);
	g_brush->SetColor(Hex(0xFFFFFF, a * 0.18f));
	g_rt->FillEllipse(D2D1::Ellipse({ px, yy }, 7, 7), g_brush);
	g_brush->SetColor(Hex(0xFFFFFF, a));
	g_rt->FillEllipse(D2D1::Ellipse({ px, yy }, 2.5f, 2.5f), g_brush);
}

static void PageDone(float pa, bool live) {
	float dy, a;
	a = Appear(0, dy) * pa;
	Text(L"v" TLK_VERSION, F_EYEBROW, LX, 168 + dy, 400, 20, Hex(0x6E7681), a);
	a = Appear(1, dy) * pa;
	Text(T(txt::doneTitle), F_HEAD, LX - 2, 192 + dy, 480, 70, Hex(0xE4E7EC), a);
	a = Appear(2, dy) * pa;
	Text(T(txt::doneLead), F_LEAD, LX, 266 + dy, 440, 60, Hex(0x8A8F98), a);
	a = Appear(3, dy) * pa;
	float bw = Button(ID_OPEN, T(txt::open), LX, 352 + dy, PRIMARY, a, live);
	Button(ID_CLOSE, T(txt::close), LX + bw + 12, 352 + dy, GHOST, a, live);
}

static void PageFailed(float pa, bool live) {
	float dy, a;
	a = Appear(0, dy) * pa;
	Text(T(txt::errorTitle), F_HEAD, LX - 2, 150 + dy, 480, 130, Hex(0xE4E7EC), a);
	a = Appear(1, dy) * pa;
	Text(Fmt(T(txt::errorLead), g_exitCode), F_LEAD, LX, 278 + dy, 460, 60, Hex(0x8A8F98), a);
	a = Appear(2, dy) * pa;
	float bw = Button(ID_RETRY, T(txt::retry), LX, 364 + dy, PRIMARY, a, live);
	bw += Button(ID_LOG, T(txt::log), LX + bw + 12, 364 + dy, GHOST, a, live);
	Button(ID_CLOSE, T(txt::close), LX + bw + 24, 375 + dy, LINK, a, live);
}

static void DrawPage(Page p, float pa, bool live) {
	switch (p) {
	case WELCOME: PageWelcome(pa, live); break;
	case OPTIONS: PageOptions(pa, live); break;
	case INSTALLING: PageInstalling(pa); break;
	case DONE: PageDone(pa, live); break;
	case FAILED: PageFailed(pa, live); break;
	}
}

static void Chrome(float a) {
	Text(L"Talkdedsec", F_BRAND, LX, 26, 200, 20, Hex(0xC9CDD4), a);
	bool busy = g_page == INSTALLING;
	// language segmented control
	float sx = W - 196, sy = 22;
	D2D1_RECT_F seg{ sx, sy, sx + 76, sy + 26 };
	g_brush->SetColor(Hex(0x2A2D31, a));
	g_rt->DrawRoundedRectangle(D2D1::RoundedRect({ seg.left + .5f, seg.top + .5f, seg.right - .5f, seg.bottom - .5f }, 13, 13), g_brush, 1);
	static float knob = g_lang == TR ? 0.f : 1.f;
	knob = Smooth(knob, g_lang == TR ? 0.f : 1.f, 1 / 60.f, 18);
	g_brush->SetColor(Hex(0xE4E7EC, a));
	g_rt->FillRoundedRectangle(D2D1::RoundedRect({ sx + 3 + knob * 35, sy + 3, sx + 38 + knob * 35, sy + 23 }, 10, 10), g_brush);
	Text(L"TR", F_SEG, sx + 3, sy + 6, 35, 20, g_lang == TR ? Hex(0x0B0B0C) : Hex(0x8A8F98), a, DWRITE_TEXT_ALIGNMENT_CENTER);
	Text(L"EN", F_SEG, sx + 38, sy + 6, 35, 20, g_lang == EN ? Hex(0x0B0B0C) : Hex(0x8A8F98), a, DWRITE_TEXT_ALIGNMENT_CENTER);
	if (!busy) {
		PushItem(ID_TR, { sx, sy, sx + 38, sy + 26 });
		PushItem(ID_EN, { sx + 38, sy, sx + 76, sy + 26 });
		if (Focused(ID_TR) || Focused(ID_EN)) { FocusRing(seg, 13, a); }
	}
	// window buttons
	for (int i = 0; i < 2; i++) {
		int id = i == 0 ? ID_MIN : ID_CLOSE;
		D2D1_RECT_F r{ W - 104 + i * 44.f, 16, W - 66 + i * 44.f, 54 };
		bool enabled = !(busy && id == ID_CLOSE);
		if (enabled) { PushItem(id, r, false); }
		float hv = HoverAmt(id);
		g_brush->SetColor(Hex(id == ID_CLOSE ? 0x3A1C1C : 0x17181C, a * hv));
		g_rt->FillRoundedRectangle(D2D1::RoundedRect(r, 8, 8), g_brush);
		g_brush->SetColor(Hex(0xC9CDD4, a * (enabled ? 0.55f + 0.45f * hv : 0.2f)));
		float cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
		if (id == ID_MIN) { g_rt->DrawLine({ cx - 5, cy }, { cx + 5, cy }, g_brush, 1.2f); }
		else { g_rt->DrawLine({ cx - 5, cy - 5 }, { cx + 5, cy + 5 }, g_brush, 1.2f); g_rt->DrawLine({ cx - 5, cy + 5 }, { cx + 5, cy - 5 }, g_brush, 1.2f); }
	}
	// footer link
	if (g_page != INSTALLING) {
		float lw = TextWidth(L"code.talkdedsec.com", F_SMALL);
		D2D1_RECT_F r{ W - 64 - lw, H - 44, W - 64, H - 24 };
		PushItem(ID_SITE, r, false);
		Text(L"code.talkdedsec.com", F_SMALL, r.left, r.top, lw + 4, 20, Hex(0x6E7681), a * (0.7f + 0.3f * HoverAmt(ID_SITE)));
	}
}

// ---- render ---------------------------------------------------------------------------------------

static void CreateTarget() {
	if (g_rt) { return; }
	RECT rc;
	GetClientRect(g_hwnd, &rc);
	UINT dpi = GetDpiForWindow(g_hwnd);
	D2D1_RENDER_TARGET_PROPERTIES props = D2D1::RenderTargetProperties(D2D1_RENDER_TARGET_TYPE_DEFAULT, D2D1::PixelFormat(), (float)dpi, (float)dpi);
	g_d2d->CreateHwndRenderTarget(props, D2D1::HwndRenderTargetProperties(g_hwnd, D2D1::SizeU(rc.right, rc.bottom)), &g_rt);
	if (g_rt) {
		g_rt->CreateSolidColorBrush(Hex(0xFFFFFF), &g_brush);
		g_rt->SetTextAntialiasMode(D2D1_TEXT_ANTIALIAS_MODE_GRAYSCALE);
	}
}

static void Render(float dt) {
	CreateTarget();
	if (!g_rt) { return; }

	POINT cp;
	GetCursorPos(&cp);
	ScreenToClient(g_hwnd, &cp);
	float scale = GetDpiForWindow(g_hwnd) / 96.f;
	g_mouse = { cp.x / scale, cp.y / scale };

	// hover, magnet and toggle animation from last frame's hit rects
	g_hover = ID_NONE;
	for (const Item& it : g_items) { if (Contains(it.r, g_mouse)) { g_hover = it.id; } }
	for (int id = ID_CLOSE; id <= ID_SITE; id++) {
		g_hoverAnim[id] = Smooth(HoverAmt(id), g_hover == id ? 1.f : 0.f, dt, 14);
		D2D1_POINT_2F target{ 0, 0 };
		for (const Item& it : g_items) {
			if (it.id == id && g_hover == id && (id == ID_INSTALL || id == ID_OPEN || id == ID_RETRY || id == ID_BACK)) {
				float cx = (it.r.left + it.r.right) / 2, cy = (it.r.top + it.r.bottom) / 2;
				target = { std::clamp((g_mouse.x - cx) * 0.14f, -7.f, 7.f), std::clamp((g_mouse.y - cy) * 0.22f, -5.f, 5.f) };
			}
		}
		D2D1_POINT_2F m = g_magnet.count(id) ? g_magnet[id] : D2D1_POINT_2F{ 0, 0 };
		g_magnet[id] = { Smooth(m.x, target.x, dt, 12), Smooth(m.y, target.y, dt, 12) };
	}
	for (int i = 0; i < 5; i++) { g_optAnim[i] = Smooth(g_optAnim[i], g_opt[i] ? 1.f : 0.f, dt, 16); }

	const float eyeCx = W * 0.715f, eyeCy = H * 0.49f;
	D2D1_POINT_2F gt{ std::clamp((g_mouse.x - eyeCx) / (W * 0.45f), -1.f, 1.f), std::clamp((g_mouse.y - eyeCy) / (H * 0.5f), -1.f, 1.f) };
	g_gaze = { Smooth(g_gaze.x, gt.x, dt, 5), Smooth(g_gaze.y, gt.y, dt, 5) };
	g_progress = g_permille.load() / 1000.f;
	g_progressShown = Smooth(g_progressShown, g_progress, dt, 6);

	g_rt->BeginDraw();
	g_rt->SetTransform(D2D1::Matrix3x2F::Identity());
	g_rt->Clear(Hex(0x0B0B0C));

	// soft light behind the eye, drifting with the cursor
	ID2D1RadialGradientBrush* glow = nullptr;
	ID2D1GradientStopCollection* stops = nullptr;
	D2D1_GRADIENT_STOP gs[2] = { { 0, Hex(0x1A1B1F, 1) }, { 1, Hex(0x0B0B0C, 0) } };
	g_rt->CreateGradientStopCollection(gs, 2, &stops);
	if (stops) {
		float gx = eyeCx + g_gaze.x * 18, gy = eyeCy + g_gaze.y * 12;
		g_rt->CreateRadialGradientBrush(D2D1::RadialGradientBrushProperties({ gx, gy }, { 0, 0 }, 330, 300), stops, &glow);
		if (glow) { g_rt->FillRectangle({ 0, 0, W, H }, glow); }
	}
	Release(glow); Release(stops);

	g_items.clear();
	const float boot = EaseOut(float(g_now - g_bootAt) / 0.6f);
	float eyeWidth = 430 + (g_page == INSTALLING ? 20.f : 0.f);
	DrawEye(eyeCx + g_gaze.x * 6, eyeCy + g_gaze.y * 4, eyeWidth, boot);
	Chrome(boot);

	const float exitT = float(g_now - g_exitAt);
	if (exitT < 0.22f) {
		float k = EaseOut(exitT / 0.22f);
		g_rt->SetTransform(D2D1::Matrix3x2F::Translation(0, -10 * k));
		DrawPage(g_exitPage, 1 - k, false);
		g_rt->SetTransform(D2D1::Matrix3x2F::Identity());
	}
	if (g_now >= g_enterAt) { DrawPage(g_page, boot, true); }

	if (g_rt->EndDraw() == D2DERR_RECREATE_TARGET) { Release(g_brush); Release(g_rt); }
}

// ---- actions --------------------------------------------------------------------------------------

static void Go(Page p) {
	g_exitPage = g_page;
	g_exitAt = g_now;
	g_page = p;
	g_enterAt = g_now + 0.14;
	g_focus = -1;
	g_runningWarn = false;
}

static std::wstring TempDir() {
	wchar_t b[MAX_PATH];
	GetTempPathW(MAX_PATH, b);
	return std::wstring(b) + L"tlk-setup-" + std::to_wstring(GetCurrentProcessId());
}

static void SetLocale() {
	// argv.json is the editor's own place for a fixed display language
	wchar_t* home = nullptr;
	if (FAILED(SHGetKnownFolderPath(FOLDERID_Profile, 0, nullptr, &home))) { return; }
	std::wstring dir = std::wstring(home) + L"\\.talkdedsec", file = dir + L"\\argv.json";
	CoTaskMemFree(home);
	CreateDirectoryW(dir.c_str(), nullptr);
	std::string want = g_lang == TR ? "tr" : "en", s;
	if (HANDLE f = CreateFileW(file.c_str(), GENERIC_READ, FILE_SHARE_READ, nullptr, OPEN_EXISTING, 0, nullptr); f != INVALID_HANDLE_VALUE) {
		DWORD n = GetFileSize(f, nullptr), got = 0;
		s.resize(n);
		ReadFile(f, s.data(), n, &got, nullptr);
		CloseHandle(f);
	}
	size_t k = s.find("\"locale\"");
	if (k != std::string::npos) {
		size_t q1 = s.find('"', s.find(':', k) + 1), q2 = q1 == std::string::npos ? q1 : s.find('"', q1 + 1);
		if (q2 != std::string::npos) { s.replace(q1 + 1, q2 - q1 - 1, want); }
	} else if (size_t b = s.find('{'); b != std::string::npos) {
		bool empty = s.find_first_not_of(" \t\r\n", b + 1) == s.find('}', b);
		s.insert(b + 1, "\n\t\"locale\": \"" + want + "\"" + (empty ? "" : ","));
	} else {
		s = "{\n\t\"locale\": \"" + want + "\"\n}\n";
	}
	if (HANDLE f = CreateFileW(file.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS, 0, nullptr); f != INVALID_HANDLE_VALUE) {
		DWORD put = 0;
		WriteFile(f, s.data(), (DWORD)s.size(), &put, nullptr);
		CloseHandle(f);
	}
}

static void InstallThread(std::wstring dir, std::wstring tasks, Lang lang) {
	int code = -1;
	std::wstring tmp = TempDir(), core = tmp + L"\\core.exe", progress = tmp + L"\\progress.txt";
	CreateDirectoryW(tmp.c_str(), nullptr);
	g_logPath = tmp + L"\\setup.log";
	HRSRC res = FindResourceW(nullptr, MAKEINTRESOURCEW(IDR_CORE), RT_RCDATA);
	if (res) {
		auto data = (const BYTE*)LockResource(LoadResource(nullptr, res));
		DWORD size = SizeofResource(nullptr, res), done = 0;
		HANDLE f = CreateFileW(core.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS, 0, nullptr);
		bool ok = f != INVALID_HANDLE_VALUE;
		while (ok && done < size) {
			DWORD chunk = std::min<DWORD>(4 << 20, size - done), put = 0;
			ok = WriteFile(f, data + done, chunk, &put, nullptr) && put == chunk;
			done += chunk;
			g_permille = (int)(40.0 * done / size);
		}
		if (f != INVALID_HANDLE_VALUE) { CloseHandle(f); }
		if (ok) {
			std::wstring cmd = L"\"" + core + L"\" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP- /NOCANCEL"
				L" /LANG=" + std::wstring(lang == TR ? L"turkish" : L"english") +
				L" /DIR=\"" + dir + L"\" /TASKS=\"" + tasks + L"\" /TLKPROGRESS=\"" + progress + L"\" /LOG=\"" + g_logPath + L"\"";
			STARTUPINFOW si{ sizeof(si) };
			PROCESS_INFORMATION pi{};
			if (CreateProcessW(nullptr, cmd.data(), nullptr, nullptr, FALSE, CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi)) {
				while (WaitForSingleObject(pi.hProcess, 60) == WAIT_TIMEOUT) {
					if (HANDLE pf = CreateFileW(progress.c_str(), GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE, nullptr, OPEN_EXISTING, 0, nullptr); pf != INVALID_HANDLE_VALUE) {
						char b[16]{};
						DWORD got = 0;
						ReadFile(pf, b, 15, &got, nullptr);
						CloseHandle(pf);
						int pm = atoi(b);
						if (pm > 0) { g_permille = 40 + pm * 955 / 1000; }
					}
				}
				DWORD ec = 1;
				GetExitCodeProcess(pi.hProcess, &ec);
				code = (int)ec;
				CloseHandle(pi.hThread);
				CloseHandle(pi.hProcess);
			} else {
				code = (int)GetLastError();
			}
		} else {
			code = (int)GetLastError();
		}
	}
	DeleteFileW(core.c_str());
	DeleteFileW(progress.c_str());
	if (code == 0) {
		SetLocale();
		g_permille = 1000;
		DeleteFileW(g_logPath.c_str());
		RemoveDirectoryW(tmp.c_str());
	}
	PostMessageW(g_hwnd, WM_APP_DONE, (WPARAM)code, 0);
}

static void StartInstall() {
	if (HANDLE m = OpenMutexW(SYNCHRONIZE, FALSE, L"talkdedsec")) {
		CloseHandle(m);
		g_runningWarn = true;
		g_warnAt = g_now;
		if (g_page != WELCOME) { Go(WELCOME); g_runningWarn = true; g_warnAt = g_now + 0.3; }
		return;
	}
	const wchar_t* names[5] = { L"desktopicon", L"addtopath", L"addcontextmenufiles,addcontextmenufolders", L"associatewithfiles", nullptr };
	std::wstring tasks;
	for (int i = 0; i < 4; i++) { if (g_opt[i]) { tasks += (tasks.empty() ? L"" : L",") + std::wstring(names[i]); } }
	g_permille = 0;
	g_progressShown = 0;
	Go(INSTALLING);
	std::thread(InstallThread, g_dir, tasks, g_lang).detach();
}

static void ChooseFolder() {
	IFileOpenDialog* dlg = nullptr;
	if (FAILED(CoCreateInstance(CLSID_FileOpenDialog, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&dlg)))) { return; }
	DWORD o = 0;
	dlg->GetOptions(&o);
	dlg->SetOptions(o | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM);
	IShellItem* item = nullptr;
	if (SUCCEEDED(dlg->Show(g_hwnd)) && SUCCEEDED(dlg->GetResult(&item))) {
		wchar_t* p = nullptr;
		if (SUCCEEDED(item->GetDisplayName(SIGDN_FILESYSPATH, &p))) {
			std::wstring picked = p;
			CoTaskMemFree(p);
			// a bare parent folder gets our own subfolder, like every installer does
			size_t slash = picked.find_last_of(L"\\/");
			std::wstring leaf = slash == std::wstring::npos ? picked : picked.substr(slash + 1);
			if (_wcsicmp(leaf.c_str(), L"Talkdedsec") != 0) { picked += (picked.back() == L'\\' ? L"" : L"\\") + std::wstring(L"Talkdedsec"); }
			g_dir = picked;
		}
		item->Release();
	}
	dlg->Release();
}

static void Launch() {
	std::wstring exe = g_dir + L"\\Talkdedsec.exe";
	ShellExecuteW(nullptr, L"open", exe.c_str(), nullptr, g_dir.c_str(), SW_SHOWNORMAL);
}

static void Activate(int id) {
	switch (id) {
	case ID_CLOSE: if (g_page != INSTALLING) { DestroyWindow(g_hwnd); } break;
	case ID_MIN: ShowWindow(g_hwnd, SW_MINIMIZE); break;
	case ID_TR: g_lang = TR; break;
	case ID_EN: g_lang = EN; break;
	case ID_INSTALL: case ID_RETRY: StartInstall(); break;
	case ID_OPTIONS: Go(OPTIONS); break;
	case ID_BACK: Go(WELCOME); break;
	case ID_CHANGE: ChooseFolder(); break;
	case ID_OPEN: Launch(); DestroyWindow(g_hwnd); break;
	case ID_LOG: ShellExecuteW(nullptr, L"open", g_logPath.c_str(), nullptr, nullptr, SW_SHOWNORMAL); break;
	case ID_SITE: ShellExecuteW(nullptr, L"open", L"https://code.talkdedsec.com", nullptr, nullptr, SW_SHOWNORMAL); break;
	default:
		if (id >= ID_OPT0 && id <= ID_OPT4) { g_opt[id - ID_OPT0] = !g_opt[id - ID_OPT0]; }
	}
}

// ---- window ---------------------------------------------------------------------------------------

static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
	switch (msg) {
	case WM_NCCALCSIZE:
		if (wp) { return 0; } // client area covers the whole window; DWM still draws shadow and rounded corners
		break;
	case WM_NCHITTEST: {
		POINT p{ GET_X_LPARAM(lp), GET_Y_LPARAM(lp) };
		ScreenToClient(hwnd, &p);
		float s = GetDpiForWindow(hwnd) / 96.f;
		D2D1_POINT_2F dp{ p.x / s, p.y / s };
		for (const Item& it : g_items) { if (Contains(it.r, dp)) { return HTCLIENT; } }
		return HTCAPTION; // every empty pixel drags the window
	}
	case WM_SETCURSOR:
		if (LOWORD(lp) == HTCLIENT) { SetCursor(LoadCursor(nullptr, IDC_HAND)); return TRUE; }
		break;
	case WM_LBUTTONDOWN:
		g_keyboard = false;
		g_pressed = g_hover;
		SetCapture(hwnd);
		return 0;
	case WM_LBUTTONUP: {
		ReleaseCapture();
		int id = g_pressed;
		g_pressed = ID_NONE;
		if (id != ID_NONE && id == g_hover) { Activate(id); }
		return 0;
	}
	case WM_KEYDOWN: {
		std::vector<int> order;
		for (int i = 0; i < (int)g_items.size(); i++) { if (g_items[i].focusable) { order.push_back(i); } }
		if (wp == VK_TAB && !order.empty()) {
			g_keyboard = true;
			bool back = GetKeyState(VK_SHIFT) < 0;
			auto at = std::find(order.begin(), order.end(), g_focus);
			int pos = at == order.end() ? (back ? 0 : -1) : int(at - order.begin());
			pos = (pos + (back ? -1 : 1) + (int)order.size()) % (int)order.size();
			g_focus = order[pos];
		} else if ((wp == VK_RETURN || wp == VK_SPACE) && g_keyboard && g_focus >= 0 && g_focus < (int)g_items.size()) {
			Activate(g_items[g_focus].id);
		} else if (wp == VK_RETURN && (g_page == WELCOME || g_page == OPTIONS)) {
			StartInstall();
		} else if (wp == VK_ESCAPE) {
			if (g_page == OPTIONS) { Go(WELCOME); } else if (g_page != INSTALLING) { DestroyWindow(hwnd); }
		}
		return 0;
	}
	case WM_APP_DONE:
		g_exitCode = (int)wp;
		if (g_exitCode == 0) {
			g_doneAt = g_now;
			Go(DONE);
			if (g_opt[4]) { Launch(); }
		} else {
			Go(FAILED);
		}
		return 0;
	case WM_DPICHANGED: {
		auto r = (RECT*)lp;
		SetWindowPos(hwnd, nullptr, r->left, r->top, r->right - r->left, r->bottom - r->top, SWP_NOZORDER | SWP_NOACTIVATE);
		Release(g_brush); Release(g_rt);
		return 0;
	}
	case WM_SIZE:
		if (g_rt) { g_rt->Resize(D2D1::SizeU(LOWORD(lp), HIWORD(lp))); }
		return 0;
	case WM_CLOSE:
		if (g_page == INSTALLING) { return 0; }
		break;
	case WM_DESTROY:
		PostQuitMessage(0);
		return 0;
	}
	return DefWindowProcW(hwnd, msg, wp, lp);
}

static void PickFonts() {
	IDWriteFontCollection* sys = nullptr;
	g_dw->GetSystemFontCollection(&sys);
	UINT32 idx;
	BOOL exists = FALSE;
	if (sys && SUCCEEDED(sys->FindFamilyName(L"Segoe UI Variable Display", &idx, &exists)) && exists) {
		g_display = L"Segoe UI Variable Display";
		g_text = L"Segoe UI Variable Text";
	}
	Release(sys);
}

static void DefaultDir() {
	HKEY k;
	if (RegOpenKeyExW(HKEY_CURRENT_USER, APP_ID_KEY, 0, KEY_READ, &k) == ERROR_SUCCESS) {
		wchar_t b[MAX_PATH]{};
		DWORD n = sizeof(b);
		if (RegQueryValueExW(k, L"InstallLocation", nullptr, nullptr, (BYTE*)b, &n) == ERROR_SUCCESS && b[0]) {
			g_dir = b;
			while (!g_dir.empty() && g_dir.back() == L'\\') { g_dir.pop_back(); }
			g_isUpdate = true;
		}
		RegCloseKey(k);
	}
	if (g_dir.empty()) {
		wchar_t* p = nullptr;
		if (SUCCEEDED(SHGetKnownFolderPath(FOLDERID_UserProgramFiles, 0, nullptr, &p))) { g_dir = std::wstring(p) + L"\\Talkdedsec"; CoTaskMemFree(p); }
	}
}

int WINAPI wWinMain(HINSTANCE inst, HINSTANCE, PWSTR, int show) {
	SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
	CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
	g_lang = PRIMARYLANGID(GetUserDefaultUILanguage()) == LANG_TURKISH ? TR : EN;
	DefaultDir();
	D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED, &g_d2d);
	DWriteCreateFactory(DWRITE_FACTORY_TYPE_SHARED, __uuidof(IDWriteFactory), (IUnknown**)&g_dw);
	if (!g_d2d || !g_dw || !LoadEye()) {
		MessageBoxW(nullptr, L"Setup could not start (graphics).", L"Talkdedsec", MB_ICONERROR);
		return 1;
	}
	PickFonts();

	WNDCLASSEXW wc{ sizeof(wc) };
	wc.lpfnWndProc = WndProc;
	wc.hInstance = inst;
	wc.hIcon = LoadIconW(inst, MAKEINTRESOURCEW(1));
	wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
	wc.hbrBackground = CreateSolidBrush(RGB(0x0B, 0x0B, 0x0C));
	wc.lpszClassName = L"TalkdedsecSetup";
	RegisterClassExW(&wc);

	POINT origin{ 0, 0 };
	HMONITOR mon = MonitorFromPoint(origin, MONITOR_DEFAULTTOPRIMARY);
	MONITORINFO mi{ sizeof(mi) };
	GetMonitorInfoW(mon, &mi);
	UINT dpi = 96;
	{ UINT dx, dy; if (SUCCEEDED(GetDpiForMonitor(mon, MDT_EFFECTIVE_DPI, &dx, &dy))) { dpi = dx; } }
	int w = MulDiv((int)W, dpi, 96), h = MulDiv((int)H, dpi, 96);
	int x = mi.rcWork.left + (mi.rcWork.right - mi.rcWork.left - w) / 2, y = mi.rcWork.top + (mi.rcWork.bottom - mi.rcWork.top - h) / 2;
	g_hwnd = CreateWindowExW(WS_EX_APPWINDOW, wc.lpszClassName, L"Talkdedsec", WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
		x, y, w, h, nullptr, nullptr, inst, nullptr);
	BOOL dark = TRUE;
	DwmSetWindowAttribute(g_hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, &dark, sizeof(dark));
	DWM_WINDOW_CORNER_PREFERENCE corner = DWMWCP_ROUND;
	DwmSetWindowAttribute(g_hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &corner, sizeof(corner));
	COLORREF border = RGB(0x1C, 0x1E, 0x22);
	DwmSetWindowAttribute(g_hwnd, DWMWA_BORDER_COLOR, &border, sizeof(border));
	MARGINS m{ 0, 0, 0, 1 };
	DwmExtendFrameIntoClientArea(g_hwnd, &m);
	SetWindowPos(g_hwnd, nullptr, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED);

	LARGE_INTEGER freq, t0, t1;
	QueryPerformanceFrequency(&freq);
	QueryPerformanceCounter(&t0);
	g_now = 0;
	g_bootAt = 0.05;
	g_enterAt = 0.45;
	ShowWindow(g_hwnd, show);

	MSG msg{};
	double last = 0;
	for (;;) {
		while (PeekMessageW(&msg, nullptr, 0, 0, PM_REMOVE)) {
			if (msg.message == WM_QUIT) { CoUninitialize(); return (int)msg.wParam; }
			TranslateMessage(&msg);
			DispatchMessageW(&msg);
		}
		if (IsIconic(g_hwnd)) { WaitMessage(); continue; }
		QueryPerformanceCounter(&t1);
		g_now = double(t1.QuadPart - t0.QuadPart) / freq.QuadPart;
		float dt = (float)std::min(0.05, g_now - last);
		last = g_now;
		Render(dt);
		DwmFlush();
	}
}
