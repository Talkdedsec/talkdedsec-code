import type { Metadata } from "next";
import { getDict, resolveLocale } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { DOWNLOADS, LOCALES, METRICS, SITE } from "@/lib/site";

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
	const description = fill(d.download.metaDesc, { size: METRICS.installerMB });
	return {
		title: d.download.pageTitle,
		description,
		alternates: {
			canonical: `/${locale}/indir/`,
			languages: { tr: "/tr/indir/", en: "/en/indir/", "x-default": "/tr/indir/" },
		},
		openGraph: {
			type: "website",
			url: `${SITE.url}/${locale}/indir/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${d.download.pageTitle} — ${SITE.name}`,
			description,
		},
		twitter: { card: "summary_large_image", title: `${d.download.pageTitle} — ${SITE.name}`, description },
	};
}

export default async function IndirPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);

	return (
		<div className="section-y">
			<div className="shell max-w-3xl">
				<p className="eyebrow font-[family-name:var(--font-mono)]">{d.download.pageTitle}</p>
				<h1 className="mt-4 text-balance page-title fade-up text-text-hi">
					Talkdedsec{" "}
					<span className="tnum font-[family-name:var(--font-mono)] text-[0.55em] font-normal text-text-dim">
						{SITE.version}
					</span>
				</h1>

				<div className="mt-10 rounded-[3px] border border-line-strong bg-bg-1 p-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-[16px] font-medium text-text-hi">{DOWNLOADS.windowsX64.label}</p>
							<p className="mt-1.5 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
								{DOWNLOADS.windowsX64.file} · {formatNumber(DOWNLOADS.windowsX64.sizeMB, locale)} MB
							</p>
						</div>
						<a
							href={DOWNLOADS.windowsX64.primary}
							className="shrink-0 rounded-[3px] bg-accent px-6 py-3 text-center text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90"
						>
							{d.nav.downloadFile}
						</a>
					</div>
				</div>

				<ul className="mt-10 flex flex-col gap-4">
					{d.download.notes.map((note) => (
						<li key={note} className="flex gap-3 text-[14.5px] leading-[1.65] text-text-mid">
							<span className="mt-[10px] h-[3px] w-[3px] shrink-0 rounded-full bg-text-dim" aria-hidden="true" />
							{note}
						</li>
					))}
				</ul>

				<div className="mt-14">
					<h2 className="text-[15px] font-medium text-text-hi">{d.download.otherPlatforms}</h2>
					<div className="mt-4 overflow-hidden rounded-[3px] border border-line">
						{["Windows arm64", "macOS", "Linux"].map((p, i) => (
							<div
								key={p}
								className="flex items-center justify-between px-5 py-3.5"
								style={{ borderTop: i === 0 ? undefined : "1px solid var(--color-line)" }}
							>
								<span className="text-[14px] text-text-mid">{p}</span>
								<span className="font-[family-name:var(--font-mono)] text-[11.5px] text-text-dim">
									{d.download.planned}
								</span>
							</div>
						))}
					</div>
					<p className="mt-4 text-[13px] leading-relaxed text-text-dim">{d.download.platformNote}</p>
				</div>

				<div className="mt-14 rounded-[3px] border border-line bg-bg-1 p-6">
					<p className="text-[14px] leading-relaxed text-text-mid">{fill(d.download.sizeNote, { size: formatNumber(METRICS.packageGB, locale, 2) })}</p>
				</div>
			</div>
		</div>
	);
}
