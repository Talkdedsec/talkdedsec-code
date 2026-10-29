import type { Locale, ThemeId } from "./site";

export interface ThemePalette {
	bg: string;
	bgPanel: string;
	line: string;
	fg: string;
	gutter: string;
	gutterActive: string;
	comment: string;
	string: string;
	keyword: string;
	number: string;
	type: string;
	fn: string;
	punct: string;
	variable: string;
	selection: string;
}

export const PALETTE: Record<ThemeId, ThemePalette> = {
	dark: {
		bg: "#0b0b0c", bgPanel: "#0e0e10", line: "#17181c", fg: "#c9cdd4",
		gutter: "#3a3e45", gutterActive: "#8a8f98", comment: "#75816f", string: "#a3b8a3",
		keyword: "#9aa9c4", number: "#c4a98a", type: "#a8b4a0", fn: "#c9cdd4",
		punct: "#7a7f87", variable: "#b4b9c1", selection: "#2a3038",
	},
	midnight: {
		bg: "#070a12", bgPanel: "#0a0e1a", line: "#131b2b", fg: "#c3cbda",
		gutter: "#3a455c", gutterActive: "#93a0b8", comment: "#6b8472", string: "#8fb8a8",
		keyword: "#7fa3d9", number: "#c9a87c", type: "#8fc0c8", fn: "#c6d2e6",
		punct: "#6d7a93", variable: "#b4c0d4", selection: "#22314c",
	},
	matrix: {
		bg: "#050806", bgPanel: "#080d0a", line: "#101a14", fg: "#b8d4be",
		gutter: "#33473a", gutterActive: "#8aae93", comment: "#817b72", string: "#9ed4a8",
		keyword: "#5fbf85", number: "#c9c47c", type: "#7fc4a8", fn: "#c6e0cb",
		punct: "#5f7f68", variable: "#aecab4", selection: "#1b3324",
	},
	ember: {
		bg: "#0d0906", bgPanel: "#120d09", line: "#1c150e", fg: "#dbcdbe",
		gutter: "#4a4034", gutterActive: "#b39c86", comment: "#8a8578", string: "#c4b07a",
		keyword: "#d08843", number: "#e0a05f", type: "#c9a87f", fn: "#e6d7c2",
		punct: "#8a7660", variable: "#cbbba6", selection: "#3a2a18",
	},
	light: {
		bg: "#fbfbfc", bgPanel: "#f3f4f6", line: "#e2e4e9", fg: "#26282d",
		gutter: "#a6abb5", gutterActive: "#4a4e57", comment: "#75705f", string: "#3f6b4f",
		keyword: "#3b5a8c", number: "#8a5a2b", type: "#3f6b6b", fn: "#26282d",
		punct: "#6a6f79", variable: "#3a3e45", selection: "#d3dae4",
	},
};

export type TokenKind = keyof Omit<ThemePalette, "bg" | "bgPanel" | "line" | "gutter" | "gutterActive" | "selection">;
export type Token = [TokenKind, string];

const COMMENT: Record<Locale, string> = {
	tr: "// varsayılanlar tek yerden gelir",
	en: "// defaults live in one place",
};

/** Editör görüntüsü kodla kurulur; ekran görüntüsü kullanılmaz. */
const LINES: Token[][] = [
	[["keyword", "import"], ["punct", " { "], ["fn", "createAgent"], ["punct", " } "], ["keyword", "from"], ["string", " '@talkdedsec/core'"], ["punct", ";"]],
	[["keyword", "import"], ["punct", " { "], ["fn", "readProject"], ["punct", ", "], ["fn", "watchFiles"], ["punct", " } "], ["keyword", "from"], ["string", " './workspace'"], ["punct", ";"]],
	[],
	[["keyword", "interface"], ["type", " SessionOptions"], ["punct", " {"]],
	[["variable", "  provider"], ["punct", ": "], ["string", "'local'"], ["punct", " | "], ["string", "'remote'"], ["punct", ";"]],
	[["variable", "  permissions"], ["punct", ": "], ["string", "'ask'"], ["punct", " | "], ["string", "'acceptEdits'"], ["punct", ";"]],
	[["variable", "  maxTurns"], ["punct", ": "], ["type", "number"], ["punct", ";"]],
	[["punct", "}"]],
	[],
	[["comment", "@comment"]],
	[["keyword", "const"], ["variable", " DEFAULTS"], ["punct", ": "], ["type", "SessionOptions"], ["punct", " = {"]],
	[["variable", "  provider"], ["punct", ": "], ["string", "'local'"], ["punct", ","]],
	[["variable", "  permissions"], ["punct", ": "], ["string", "'acceptEdits'"], ["punct", ","]],
	[["variable", "  maxTurns"], ["punct", ": "], ["number", "40"], ["punct", ","]],
	[["punct", "};"]],
	[],
	[["keyword", "export async function"], ["fn", " startSession"], ["punct", "("], ["variable", "root"], ["punct", ": "], ["type", "string"], ["punct", ") {"]],
	[["keyword", "  const"], ["variable", " project"], ["punct", " = "], ["keyword", "await"], ["fn", " readProject"], ["punct", "("], ["variable", "root"], ["punct", ");"]],
	[],
	[["keyword", "  if"], ["punct", " (!"], ["variable", "project"], ["punct", "."], ["variable", "files"], ["punct", "."], ["variable", "length"], ["punct", ") {"]],
	[["keyword", "    throw new"], ["fn", " Error"], ["punct", "("], ["string", "`No source files under ${root}`"], ["punct", ");"]],
	[["punct", "  }"]],
	[],
	[["keyword", "  const"], ["variable", " agent"], ["punct", " = "], ["fn", "createAgent"], ["punct", "({"]],
	[["variable", "    provider"], ["punct", ": "], ["variable", "DEFAULTS"], ["punct", "."], ["variable", "provider"], ["punct", ","]],
	[["variable", "    context"], ["punct", ": "], ["variable", "project"], ["punct", "."], ["fn", "summarize"], ["punct", "(),"]],
	[["punct", "  });"]],
	[],
	[["fn", "  watchFiles"], ["punct", "("], ["variable", "root"], ["punct", ", ("], ["variable", "event"], ["punct", ") => "], ["variable", "agent"], ["punct", "."], ["fn", "notify"], ["punct", "("], ["variable", "event"], ["punct", "));"]],
	[["keyword", "  return"], ["variable", " agent"], ["punct", "."], ["fn", "run"], ["punct", "({ "], ["variable", "maxTurns"], ["punct", ": "], ["number", "40"], ["punct", " });"]],
	[["punct", "}"]],
];

export function codeLines(locale: Locale): Token[][] {
	return LINES.map((line) =>
		line.map(([kind, text]) => (text === "@comment" ? [kind, COMMENT[locale]] : [kind, text]) as Token),
	);
}

/** Monaco'ya verilen kaynak, statik editör görselindeki kodun aynısı olmalı. */
export function sampleSource(locale: Locale) {
	return codeLines(locale)
		.map((line) => line.map(([, text]) => text).join(""))
		.join("\n");
}