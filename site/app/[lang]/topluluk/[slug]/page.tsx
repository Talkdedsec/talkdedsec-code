import type { Metadata } from "next";
import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { EditorFrame } from "@/components/editor-frame";
import { COMMUNITY_THEMES, getTheme } from "@/lib/community";
import { getDict, resolveLocale } from "@/lib/i18n";
import { LOCALES, SITE, THEMES } from "@/lib/site";
import { PALETTE } from "@/lib/theme-tokens";

export function generateStaticParams() {
	return LOCALES.flatMap((lang) => COMMUNITY_THEMES.map((t) => ({ lang, slug: t.slug })));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const theme = getTheme(slug);
	if (!theme) return {};

	const description = theme.description[locale];
	return {
		title: theme.name,
		description,
		alternates: {
			canonical: `/${locale}/topluluk/${slug}/`,
			languages: {
				tr: `/tr/topluluk/${slug}/`,
				en: `/en/topluluk/${slug}/`,
				"x-default": `/tr/topluluk/${slug}/`,
			},
		},
		openGraph: {
			type: "article",
			url: `${SITE.url}/${locale}/topluluk/${slug}/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${theme.name} — ${SITE.name}`,
			description,
		},
		twitter: { card: "summary_large_image", title: `${theme.name} — ${SITE.name}`, description },
	};
}

export default async function TemaPage({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	const theme = getTheme(slug);

	if (!theme) notFound();

	const meta = THEMES.find((t) => t.id === theme.builtin);
	const palette = theme.builtin ? PALETTE[theme.builtin] : undefined;

	const swatches = palette
		? [
				{ k: "editor.background", v: palette.bg },
				{ k: "editor.foreground", v: palette.fg },
				{ k: "keyword", v: palette.keyword },
				{ k: "string", v: palette.string },
				{ k: "number", v: palette.number },
				{ k: "comment", v: palette.comment },
			]
		: [];

	const others = COMMUNITY_THEMES.filter((t) => t.slug !== theme.slug).slice(0, 4);

	return (
		<div className="section-y">
			<div className="shell">
				<Link
					href={`/${locale}/topluluk/`}
					className="link-underline inline-block font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.1em] text-text-dim hover:text-text"
				>
					← {d.meta.community}
				</Link>

				<div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
					<div className="min-w-0">
						<div className="flex items-center gap-3">
							<span
								className="h-3 w-3 shrink-0 rounded-full"
								style={{ background: meta?.hue ?? theme.colors?.hue }}
								aria-hidden="true"
							/>
							<h1 className="text-balance page-title-sm fade-up text-text-hi">
								{theme.name}
							</h1>
						</div>

						<p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-text-mid">
							{theme.description[locale]}
						</p>

						<div className="mt-10 overflow-hidden rounded-[3px] border border-line">
							<EditorFrame
								theme={theme.builtin ?? "dark"}
								className="w-full border-0"
								locale={locale}
								label={`${theme.name} — ${d.meta.editorPreview}`}
							/>
						</div>

						{swatches.length > 0 && (
							<div className="mt-12">
								<h2 className="text-[15px] font-medium text-text-hi">
									{d.theme.palette}
								</h2>
								<div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-3">
									{swatches.map((s) => (
										<div key={s.k} className="flex items-center gap-3 bg-bg px-4 py-3.5">
											<span
												className="h-6 w-6 shrink-0 rounded-[2px] border border-line-strong"
												style={{ background: s.v }}
												aria-hidden="true"
											/>
											<span className="min-w-0">
												<span className="block truncate font-[family-name:var(--font-mono)] text-[11px] text-text-dim">
													{s.k}
												</span>
												<span className="block font-[family-name:var(--font-mono)] text-[12px] text-text">
													{s.v}
												</span>
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="mt-12">
							<h2 className="text-[15px] font-medium text-text-hi">{d.theme.install}</h2>
							<ol className="mt-4 flex flex-col gap-3">
								{d.theme.steps.map((step, i) => (

									<li key={step} className="flex gap-3 text-[14.5px] leading-[1.65] text-text-mid">
										<span className="tnum shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
											{String(i + 1).padStart(2, "0")}
										</span>
										{step}
									</li>
								))}
							</ol>
						</div>
					</div>

					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="rounded-[3px] border border-line bg-bg-1 p-6">
							<dl className="flex flex-col gap-4 text-[13.5px]">
								<div>
									<dt className="text-text-dim">{d.theme.author}</dt>
									<dd className="mt-1">
										<a
											href={`https://github.com/${theme.author.github}`}
											rel="noopener"
											className="link-underline text-text hover:text-text-hi"
										>
											{theme.author.name}
										</a>
									</dd>
								</div>
								<div>
									<dt className="text-text-dim">{d.theme.kind}</dt>
									<dd className="mt-1 text-text">{theme.kind === "dark" ? d.theme.kindDark : d.theme.kindLight}</dd>
								</div>
								<div>
									<dt className="text-text-dim">{d.theme.license}</dt>
									<dd className="mt-1 text-text">{theme.license}</dd>
								</div>
								<div>
									<dt className="text-text-dim">{d.theme.tags}</dt>
									<dd className="mt-2 flex flex-wrap gap-1.5">
										{theme.tags.map((tag) => (
											<span
												key={tag.en}
												className="rounded-[2px] border border-line-strong px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-text-dim"
											>
												{tag[locale]}
											</span>
										))}
									</dd>
								</div>
							</dl>

							<a
								href={theme.raw}
								download
								className="mt-6 block rounded-[3px] bg-accent px-4 py-2.5 text-center text-[14px] font-medium text-accent-ink transition-opacity hover:opacity-90"
							>
								{d.theme.downloadJson}
							</a>
							<a
								href={theme.source}
								rel="noopener"
								className="link-underline mt-3 block text-center text-[13px] text-text-mid hover:text-text-hi"
							>
								{d.theme.viewSource}
							</a>
						</div>

						{others.length > 0 && (
							<div className="mt-8">
								<p className="eyebrow font-[family-name:var(--font-mono)]">
									{d.theme.more}
								</p>
								<div className="mt-4 flex flex-col gap-2">
									{others.map((o) => {
										const m = THEMES.find((t) => t.id === o.builtin);
										return (
											<Link
												key={o.slug}
												href={`/${locale}/topluluk/${o.slug}/`}
												className="flex items-center gap-3 rounded-[3px] border border-line px-4 py-3 text-[14px] text-text-mid transition-colors hover:border-line-strong hover:text-text-hi"
											>
												<span
													className="h-2.5 w-2.5 shrink-0 rounded-full"
													style={{ background: m?.hue ?? o.colors?.hue }}
													aria-hidden="true"
												/>
												{o.name.replace("Talkdedsec ", "")}
											</Link>
										);
									})}
								</div>
							</div>
						)}
					</aside>
				</div>
			</div>
		</div>
	);
}
