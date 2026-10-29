/** GitHub Pages proje sitesi alt yolda yayınlanır; next.config.ts basePath ile aynı olmalı. */
export const BASE = "/talkdedsec-code";

export const SITE = {
	name: "Talkdedsec",
	domain: "talkdedsec.github.io/talkdedsec-code",
	url: "https://talkdedsec.github.io/talkdedsec-code",
	tagline: {
		tr: "Sana ait bir kod editörü",
		en: "A code editor that answers to you",
	},
	version: "1.144.0",
	releasedAt: "2026-10-29",
	repo: "https://github.com/Talkdedsec/talkdedsec-code",
	themesRepo: "https://github.com/Talkdedsec/talkdedsec-themes",
} as const;

/** Ölçümler gerçek: bu makinede, üretim build'i üzerinde alındı. /olcum sayfası yöntemi anlatır. */
export const METRICS = {
	startupSeconds: 0.31,
	processCount: 8,
	memoryMB: 1460,
	packageGB: 0.75,
	installerMB: 187.5,
	extensions: 94,
	extensionsBefore: 98,
	themeTokens: 183,
	terminalColors: 16,
	telemetryEndpoints: 0,
	sourceMaps: 0,
} as const;

export const MEASURED_ON = {
	os: "Windows 11 Pro 26300",
	cpu: "x64",
	build: { tr: "üretim (minify), soğuk profil", en: "production (minified), cold profile" },
	date: "2026-10-29",
} as const;

export type ThemeId = "dark" | "midnight" | "matrix" | "ember" | "light";

export interface ThemeMeta {
	id: ThemeId;
	settingsId: string;
	hue: string;
	bg: string;
	fg: string;
	kind: "dark" | "light";
}

export const THEMES: ThemeMeta[] = [
	{ id: "dark", settingsId: "Talkdedsec Dark", hue: "#c9cdd4", bg: "#0b0b0c", fg: "#c9cdd4", kind: "dark" },
	{ id: "midnight", settingsId: "Talkdedsec Midnight", hue: "#5b8def", bg: "#070a12", fg: "#c3cbda", kind: "dark" },
	{ id: "matrix", settingsId: "Talkdedsec Matrix", hue: "#35d07f", bg: "#050806", fg: "#b8d4be", kind: "dark" },
	{ id: "ember", settingsId: "Talkdedsec Ember", hue: "#ff6b35", bg: "#0d0906", fg: "#dbcdbe", kind: "dark" },
	{ id: "light", settingsId: "Talkdedsec Light", hue: "#e8e9eb", bg: "#fbfbfc", fg: "#26282d", kind: "light" },
];

export const DOWNLOADS = {
	windowsX64: {
		label: "Windows x64",
		file: "TalkdedsecSetup.exe",
		sizeMB: 187.5,
		primary: `${SITE.repo}/releases/latest/download/TalkdedsecSetup.exe`,
	},
} as const;

/** Kaldırılan dış uç noktalar — "sıfır telemetri" iddiasının somut dayanağı. */
export const REMOVED_ENDPOINTS: { host: string; note?: { tr: string; en: string } }[] = [
	{ host: "api.github.com/copilot_internal/user" },
	{ host: "api.github.com/copilot_internal/v2/token" },
	{ host: "api.github.com/copilot/mcp_registry" },
	{ host: "api.github.com/copilot_internal/managed_settings" },
	{ host: "falcon-caas.mai.microsoft.com", note: { tr: "ses", en: "voice" } },
	{ host: "schemastore.org", note: { tr: "JSON şema indirme", en: "JSON schema download" } },
	{ host: "registry.npmjs.org", note: { tr: "paket sorgusu", en: "package lookup" } },
	{ host: "redirector.gvt1.com", note: { tr: "yazım denetimi sözlüğü", en: "spellcheck dictionary" } },
	{ host: "raw.githubusercontent.com", note: { tr: "chat eklenti listesi", en: "chat plugin list" } },
];

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";
