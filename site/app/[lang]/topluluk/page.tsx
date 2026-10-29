import type { Metadata } from "next";
import { Link } from "@/components/link";
import { EditorFrame } from "@/components/editor-frame";
import { getDict, resolveLocale } from "@/lib/i18n";
import { LOCALES, SITE, THEMES } from "@/lib/site";

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	return {
		title: d.meta.community,
		description: d.community.metaDesc,
		alternates: {
			canonical: `/${locale}/topluluk/`,
			languages: { tr: "/tr/topluluk/", en: "/en/topluluk/", "x-default": "/tr/topluluk/" },
		},
		openGraph: {
			type: "website",
			url: `${SITE.url}/${locale}/topluluk/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${d.meta.community} — ${SITE.name}`,
			description: d.community.metaDesc,
		},
		twitter: { card: "summary_large_image", title: `${d.meta.community} — ${SITE.name}`, description: d.community.metaDesc },
	};
}

export default async function ToplulukPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);

	return (
		<>
			<section className="border-b border-line">
				<div className="shell pt-16 pb-14 md:pt-24 md:pb-20">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{d.community.eyebrow}</p>
					<h1 className="mt-4 max-w-3xl text-balance page-title fade-up text-text-hi">
						{d.community.title}
					</h1>
					<p className="mt-5 max-w-xl text-pretty text-[16.5px] leading-[1.68] text-text-mid">
						{d.community.lead}
					</p>
					<a
						href={SITE.themesRepo}
						className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-accent px-5 py-3 text-[14.5px] font-medium text-accent-ink transition-opacity hover:opacity-90"
					>
						{d.community.cta}
					</a>

					<Link
						href={`/${locale}/topluluk/konular/`}
						className="group mt-10 flex max-w-xl items-start gap-5 rounded-[3px] border border-line p-6 transition-colors hover:border-line-strong"
					>
						<span className="min-w-0">
							<span className="block font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-text-dim">
								{d.forum.eyebrow}
							</span>
							<span className="mt-2 block text-[17px] font-medium text-text-hi">
								{d.forum.pageTitle}
							</span>
							<span className="mt-2 block text-[14px] leading-[1.65] text-text-dim">
								{d.forum.metaDesc}
							</span>
						</span>
						<span
							aria-hidden="true"
							className="ml-auto shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-text-dim transition-colors group-hover:text-text"
						>
							→
						</span>
					</Link>
				</div>
			</section>

			<section className="section-y border-b border-line">
				<div className="shell">
					<h2 className="max-w-2xl text-balance text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi reveal">
						{d.community.howTitle}
					</h2>

					<ol className="mt-10 grid gap-px overflow-hidden rounded-[3px] border border-line bg-line md:grid-cols-2">
						{d.community.steps.map((s, i) => (
							<li key={s.t} className="bg-bg p-7">
								<span className="tnum font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
									{String(i + 1).padStart(2, "0")}
								</span>
								<h3 className="mt-3 text-[16px] font-medium text-text-hi">{s.t}</h3>
								<p className="mt-2 text-[14px] leading-[1.65] text-text-dim">{s.d}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="section-y">
				<div className="shell">
					<div className="flex flex-wrap items-end justify-between gap-4">
						<h2 className="text-balance text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
							{d.community.builtinTitle}
						</h2>
						<p className="font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
							{d.community.builtinNote}
						</p>
					</div>

					<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{THEMES.map((theme) => (
							<Link
								key={theme.id}
								href={`/${locale}/topluluk/${theme.id}/`}
								className="reveal group overflow-hidden rounded-[3px] border border-line transition-colors hover:border-line-strong"
							>
								<div className="relative aspect-[16/10] overflow-hidden">
									<EditorFrame
										theme={theme.id}
										locale={locale}
										dense
										lines={22}
										className="h-full w-full border-0"
										label={`${theme.settingsId} — ${d.meta.editorPreview}`}
									/>
								</div>
								<div className="flex items-center gap-3 border-t border-line px-4 py-3.5">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ background: theme.hue }}
										aria-hidden="true"
									/>
									<span className="text-[14px] text-text-hi">
										{theme.settingsId.replace("Talkdedsec ", "")}
									</span>
									<span className="ml-auto font-[family-name:var(--font-mono)] text-[11px] text-text-dim transition-colors group-hover:text-text">
										→
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
