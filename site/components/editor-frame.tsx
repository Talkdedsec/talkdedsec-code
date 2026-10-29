import { codeLines, PALETTE, type Token } from "@/lib/theme-tokens";
import { Mark } from "./mark";
import type { Locale, ThemeId } from "@/lib/site";

const MENU = ["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"];

function Line({ tokens, palette }: { tokens: Token[]; palette: (typeof PALETTE)[ThemeId] }) {
	if (!tokens.length) return <span>&nbsp;</span>;
	return (
		<>
			{tokens.map(([kind, text], i) => (
				<span key={i} style={{ color: palette[kind], fontStyle: kind === "comment" ? "italic" : undefined }}>
					{text}
				</span>
			))}
		</>
	);
}

function ActivityIcon({ d, color }: { d: string; color: string }) {
	return (
		<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={color} strokeWidth="1.5">
			<path d={d} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

const ICONS = [
	"M4 3h9l5 5v13H4z M13 3v5h5",
	"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4",
	"M6 3v12 M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 7v4a4 4 0 0 1-4 4H6",
	"M5 3l14 9-14 9z",
	"M3 7h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z",
];

export function EditorFrame({
	theme = "dark",
	file = "agent.ts",
	lines,
	className,
	dense = false,
	chrome = true,
	locale = "tr",
	label,
}: {
	theme?: ThemeId;
	file?: string;
	lines?: number;
	className?: string;
	dense?: boolean;
	chrome?: boolean;
	locale?: Locale;
	label: string;
}) {
	const p = PALETTE[theme];
	const all = codeLines(locale);
	const shown = lines ? all.slice(0, lines) : all;
	const fontSize = dense ? 9 : 13;
	const lineHeight = dense ? 15 : 22;
	const full = chrome && !dense;

	return (
		<div
			className={`flex flex-col ${className ?? ""}`}
			style={{ background: p.bg, borderColor: p.line }}
			role="img"
			aria-label={label}
		>
			<div
				className="flex shrink-0 items-center gap-3 border-b px-3"
				style={{ borderColor: p.line, background: p.bgPanel, height: dense ? 20 : 35 }}
				aria-hidden="true"
			>
				<span className="flex shrink-0 items-center" style={{ color: p.gutterActive }}>
					<Mark className={dense ? "h-3 w-3" : "h-[18px] w-[18px]"} />
				</span>

				{full && (
					<div className="hidden shrink-0 items-center gap-3.5 md:flex">
						{MENU.map((m) => (
							<span key={m} style={{ color: p.gutterActive, fontSize: 11.5 }}>
								{m}
							</span>
						))}
					</div>
				)}

				{full && (
					<div
						className="mx-auto hidden h-[22px] w-[220px] items-center justify-center rounded-[3px] border lg:flex"
						style={{ borderColor: p.line, background: p.bg }}
					>
						<span className="font-[family-name:var(--font-mono)]" style={{ color: p.gutterActive, fontSize: 10.5 }}>
							Talkdedsec
						</span>
					</div>
				)}

				{full && (
					<div className="ml-auto hidden shrink-0 items-center gap-3.5 md:flex">
						{["M4 12h16", "M5 5h14v14H5z", "M6 6l12 12M18 6L6 18"].map((d) => (
							<svg key={d} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={p.gutter} strokeWidth="1.4">
								<path d={d} />
							</svg>
						))}
					</div>
				)}
			</div>

			<div
				className="flex shrink-0 items-stretch border-b"
				style={{ borderColor: p.line, background: p.bgPanel, height: dense ? 18 : 34 }}
				aria-hidden="true"
			>
				<div
					className="flex items-center gap-2 border-r px-3.5"
					style={{ borderColor: p.line, background: p.bg }}
				>
					<span
						className="font-[family-name:var(--font-mono)]"
						style={{ color: p.fg, fontSize: dense ? 8 : 11.5 }}
					>
						{file}
					</span>
					{full && (
						<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke={p.gutter} strokeWidth="2">
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					)}
				</div>
			</div>

			<div className="flex min-h-0 flex-1" aria-hidden="true">
				{full && (
					<div
						className="hidden w-[46px] shrink-0 flex-col items-center gap-5 border-r pt-3.5 sm:flex"
						style={{ borderColor: p.line, background: p.bgPanel }}
					>
						{ICONS.map((d, i) => (
							<ActivityIcon key={d} d={d} color={i === 0 ? p.fg : p.gutter} />
						))}
					</div>
				)}

				<div className="min-w-0 flex-1 overflow-hidden" style={{ padding: dense ? "6px 0" : "12px 0" }}>
					<pre
						className="font-[family-name:var(--font-mono)]"
						style={{ fontSize, lineHeight: `${lineHeight}px`, margin: 0 }}
					>
						<code>
							{shown.map((tokens, i) => (
								<div key={i} className="flex">
									<span
										className="tnum shrink-0 select-none text-right"
										style={{
											color: p.gutterActive,
											width: dense ? 26 : 46,
											paddingRight: dense ? 8 : 16,
										}}
									>
										{i + 1}
									</span>
									<span className="whitespace-pre">
										<Line tokens={tokens} palette={p} />
									</span>
								</div>
							))}
						</code>
					</pre>
				</div>
			</div>

			{full && (
				<div
					className="flex shrink-0 items-center gap-4 border-t px-3.5"
					style={{ borderColor: p.line, background: p.bgPanel, height: 24 }}
					aria-hidden="true"
				>
					<span className="font-[family-name:var(--font-mono)]" style={{ color: p.gutterActive, fontSize: 10.5 }}>
						main
					</span>
					<span className="font-[family-name:var(--font-mono)]" style={{ color: p.gutterActive, fontSize: 10.5 }}>
						TypeScript
					</span>
					<span
						className="ml-auto flex items-center gap-1.5 font-[family-name:var(--font-mono)]"
						style={{ color: p.gutterActive, fontSize: 10.5 }}
					>
						<span className="h-1.5 w-1.5 rounded-full" style={{ background: "#35d07f" }} />
						agent
					</span>
				</div>
			)}
		</div>
	);
}
