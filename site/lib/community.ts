import { SITE, THEMES, type ThemeId } from "./site";
import { PALETTE } from "./theme-tokens";

export interface CommunityTheme {
	slug: string;
	name: string;
	author: { name: string; github: string };
	description: { tr: string; en: string };
	kind: "dark" | "light";
	/** yerleşik temalar için palet id'si; topluluk temaları kendi renklerini taşır */
	builtin?: ThemeId;
	colors?: { bg: string; fg: string; hue: string; line: string };
	tags: { tr: string; en: string }[];
	license: string;
	/** kaynağı gör: GitHub sayfası */
	source: string;
	/** doğrudan indirme: ham JSON */
	raw: string;
}

/**
 * Yerleşik temalar aynı şablonla yayınlanır; topluluk temaları
 * tlk-code-themes deposundan gelir ve build sırasında buraya eklenir.
 */
export const COMMUNITY_THEMES: CommunityTheme[] = THEMES.map((t) => ({
	slug: t.id,
	name: t.settingsId,
	author: { name: "Talkdedsec", github: "talkdedsec" },
	description: {
		tr: yerlesikAciklama(t.id).tr,
		en: yerlesikAciklama(t.id).en,
	},
	kind: t.kind,
	builtin: t.id,
	tags: [
		{ tr: "resmî", en: "official" },
		t.kind === "dark" ? { tr: "koyu", en: "dark" } : { tr: "açık", en: "light" },
	],
	license: "MIT",
	source: `${SITE.repo}/blob/main/extensions/theme-defaults/themes/talkdedsec_${t.id}.json`,
	raw: `https://raw.githubusercontent.com/Talkdedsec/talkdedsec-code/main/extensions/theme-defaults/themes/talkdedsec_${t.id}.json`,
}));

function yerlesikAciklama(id: ThemeId): { tr: string; en: string } {
	switch (id) {
		case "dark":
			return {
				tr: "Varsayılan tema. Nötr grafit tonları, siyaha yakın zemin; renk yalnızca anlam taşıdığında kullanılır.",
				en: "The default. Neutral graphite tones on a near-black canvas; colour appears only where it carries meaning.",
			};
		case "midnight":
			return {
				tr: "Derin lacivert zemin, soğuk mavi vurgular. Uzun gece oturumları için kontrastı yumuşak tutar.",
				en: "A deep navy canvas with cool blue accents. Keeps contrast gentle for long night sessions.",
			};
		case "matrix":
			return {
				tr: "Siyah zemin, terminal yeşili. Klasik konsol estetiğini modern kontrast oranlarıyla kurar.",
				en: "Black canvas, terminal green. Classic console aesthetics rebuilt with modern contrast ratios.",
			};
		case "ember":
			return {
				tr: "Sıcak kahve-kehribar paleti. Mavi ışığı azaltan, akşam saatlerine uygun bir seçim.",
				en: "A warm coffee-and-amber palette. Reduces blue light — a good fit for evening hours.",
			};
		case "light":
			return {
				tr: "Açık tema. Gri-beyaz zemin, koyu metin; parlak ortamlarda ve ekran paylaşımında okunur kalır.",
				en: "The light theme. Grey-white canvas, dark text; stays readable in bright rooms and screen shares.",
			};
	}
}

export function getTheme(slug: string): CommunityTheme | undefined {
	return COMMUNITY_THEMES.find((t) => t.slug === slug);
}

export function themePalette(theme: CommunityTheme) {
	if (theme.builtin) return PALETTE[theme.builtin];
	return {
		bg: theme.colors?.bg ?? "#0b0b0c",
		bgPanel: theme.colors?.bg ?? "#0e0e10",
		line: theme.colors?.line ?? "#17181c",
		fg: theme.colors?.fg ?? "#c9cdd4",
		gutter: "#3a3e45",
		gutterActive: "#8a8f98",
		comment: "#4a4e55",
		string: "#a3b8a3",
		keyword: theme.colors?.hue ?? "#9aa9c4",
		number: "#c4a98a",
		type: "#a8b4a0",
		fn: theme.colors?.fg ?? "#c9cdd4",
		punct: "#7a7f87",
		variable: "#b4b9c1",
		selection: "#2a3038",
	};
}
