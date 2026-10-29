"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorFrame } from "./editor-frame";
import type * as MonacoNS from "monaco-editor";
import type { Dict } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { PALETTE, sampleSource } from "@/lib/theme-tokens";
import { METRICS, THEMES, type Locale, type ThemeId } from "@/lib/site";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
	loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

const hex = (v: string) => v.replace("#", "");

export type ThemeDemoText = {
	themes: Dict["themes"];
	themeSelect: Dict["meta"]["themeSelect"];
	editorPreview: Dict["meta"]["editorPreview"];
};

export function ThemeDemo({ locale, t }: { locale: Locale; t: ThemeDemoText }) {
	const sample = sampleSource(locale);
	const [active, setActive] = useState<ThemeId>("dark");
	const [ready, setReady] = useState(false);
	const [inView, setInView] = useState(false);
	const shellRef = useRef<HTMLDivElement>(null);
	const monacoRef = useRef<typeof MonacoNS | null>(null);

	useEffect(() => {
		const el = shellRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ rootMargin: "600px 0px" }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const defineThemes = useCallback((monaco: typeof MonacoNS) => {
		for (const theme of THEMES) {
			const p = PALETTE[theme.id];
			monaco.editor.defineTheme(`tlk-${theme.id}`, {
				base: theme.kind === "light" ? "vs" : "vs-dark",
				inherit: true,
				rules: [
					{ token: "comment", foreground: hex(p.comment), fontStyle: "italic" },
					{ token: "string", foreground: hex(p.string) },
					{ token: "keyword", foreground: hex(p.keyword) },
					{ token: "number", foreground: hex(p.number) },
					{ token: "type", foreground: hex(p.type) },
					{ token: "identifier", foreground: hex(p.variable) },
					{ token: "delimiter", foreground: hex(p.punct) },
				],
				colors: {
					"editor.background": p.bg,
					"editor.foreground": p.fg,
					"editor.lineHighlightBackground": p.bgPanel,
					"editorLineNumber.foreground": p.gutter,
					"editorLineNumber.activeForeground": p.gutterActive,
					"editor.selectionBackground": p.selection,
					"editorCursor.foreground": p.fg,
					"editorIndentGuide.background1": p.line,
				},
			});
		}
	}, []);

	useEffect(() => {
		if (!ready || !monacoRef.current) return;
		monacoRef.current.editor.setTheme(`tlk-${active}`);
	}, [active, ready]);

	useEffect(() => {
		document.documentElement.dataset.theme = active;
		try {
			localStorage.setItem("tlk-theme", active);
		} catch {}
	}, [active]);

	useEffect(() => {
		try {
			const saved = localStorage.getItem("tlk-theme");
			if (saved && THEMES.some((theme) => theme.id === saved)) {
				setActive(saved as ThemeId);
			}
		} catch {}
	}, []);

	return (
		<section className="section-y border-b border-line" id="temalar">
			<div className="shell">
				<div className="max-w-2xl reveal">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{fill(t.themes.eyebrow, { n: formatNumber(THEMES.length, locale) })}</p>
					<h2 className="mt-4 text-balance text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
						{t.themes.title}
					</h2>
					<p className="mt-4 text-pretty text-[15.5px] leading-[1.7] text-text-mid">{fill(t.themes.lead, { tokens: METRICS.themeTokens, colors: METRICS.terminalColors })}</p>
				</div>

				<div
					className="mt-10 flex flex-wrap gap-2"
					role="group"
					aria-label={t.themeSelect}
				>
					{THEMES.map((theme) => {
						const on = theme.id === active;
						return (
							<button
								key={theme.id}
								type="button"
								aria-pressed={on}
								onClick={() => setActive(theme.id)}
								className="group inline-flex min-h-11 items-center gap-2.5 rounded-[3px] border px-3.5 text-[13px] transition-colors"
								style={{
									borderColor: on ? theme.hue : "var(--color-line)",
									color: on ? "var(--color-text-hi)" : "var(--color-text-mid)",
									background: on ? "var(--color-bg-2)" : "transparent",
								}}
							>
								<span
									className="h-2.5 w-2.5 rounded-full"
									style={{ background: theme.hue }}
									aria-hidden="true"
								/>
								{theme.settingsId.replace("Talkdedsec ", "")}
							</button>
						);
					})}
				</div>

				<div
					ref={shellRef}
					className="mt-6 overflow-hidden rounded-[3px] border border-line"
					style={{ background: THEMES.find((theme) => theme.id === active)?.bg }}
				>
					<div className="h-[470px] md:h-[560px]">
						{!inView && <EditorFrame theme={active} locale={locale} label={t.editorPreview} className="h-full w-full border-0" />}
						{inView && (
						<MonacoEditor
							defaultLanguage="typescript"
							defaultValue={sample}
							theme={`tlk-${active}`}
							beforeMount={(monaco) => {
								monacoRef.current = monaco;
								defineThemes(monaco);
							}}
							onMount={() => setReady(true)}
							options={{
								readOnly: true,
								domReadOnly: true,
								ariaLabel: t.editorPreview,
								tabIndex: -1,
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								fontSize: 13.5,
								lineHeight: 22,
								fontFamily: "var(--font-mono), monospace",
								renderLineHighlight: "line",
								scrollbar: { vertical: "hidden", horizontal: "hidden" },
								overviewRulerLanes: 0,
								folding: false,
								padding: { top: 18, bottom: 18 },
								contextmenu: false,
								automaticLayout: true,
							}}
						/>
						)}
					</div>
				</div>

				<p className="mt-4 font-[family-name:var(--font-mono)] text-[11.5px] text-chrome">{t.themes.hint}</p>
			</div>
		</section>
	);
}
