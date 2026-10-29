import type { Metadata } from "next";
import { getDict, resolveLocale } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/format";
import { LOCALES, MEASURED_ON, METRICS, SITE } from "@/lib/site";

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
		title: d.measure.pageTitle,
		description: d.measure.metaDesc,
		alternates: {
			canonical: `/${locale}/olcum/`,
			languages: { tr: "/tr/olcum/", en: "/en/olcum/", "x-default": "/tr/olcum/" },
		},
		openGraph: {
			type: "website",
			url: `${SITE.url}/${locale}/olcum/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${d.measure.pageTitle} — ${SITE.name}`,
			description: d.measure.metaDesc,
		},
		twitter: {
			card: "summary_large_image",
			title: `${d.measure.pageTitle} — ${SITE.name}`,
			description: d.measure.metaDesc,
		},
	};
}

export default async function OlcumPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	const n = (value: number, decimals?: number) => formatNumber(value, locale, decimals);

	const values: Record<string, string> = {
		startup: `${n(METRICS.startupSeconds, 2)} s`,
		processes: n(METRICS.processCount),
		memory: `${n(METRICS.memoryMB / 1024, 2)} GB`,
		installed: `${n(METRICS.packageGB, 2)} GB`,
		installer: `${n(METRICS.installerMB)} MB`,
		extensions: n(METRICS.extensions),
		sourcemaps: n(METRICS.sourceMaps),
	};

	return (
		<div className="section-y">
			<div className="shell max-w-3xl">
				<p className="eyebrow font-[family-name:var(--font-mono)]">{d.measure.eyebrow}</p>
				<h1 className="mt-4 text-balance page-title fade-up text-text-hi">
					{d.measure.title}
				</h1>
				<p className="mt-5 text-[16px] leading-[1.7] text-text-mid">{d.measure.lead}</p>

				<h2 className="mt-12 text-[15px] font-medium text-text-hi">{d.measure.conditions}</h2>

				<dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 rounded-[3px] border border-line bg-bg-1 p-6 text-[13.5px]">
					<div>
						<dt className="text-text-dim">{d.measure.os}</dt>
						<dd className="mt-1 text-text">{MEASURED_ON.os}</dd>
					</div>
					<div>
						<dt className="text-text-dim">{d.measure.arch}</dt>
						<dd className="mt-1 text-text">{MEASURED_ON.cpu}</dd>
					</div>
					<div>
						<dt className="text-text-dim">{d.measure.build}</dt>
						<dd className="mt-1 text-text">{MEASURED_ON.build[locale]}</dd>
					</div>
					<div>
						<dt className="text-text-dim">{d.measure.date}</dt>
						<dd className="mt-1 text-text">
							<time dateTime={MEASURED_ON.date}>{formatDate(MEASURED_ON.date, locale)}</time>
						</dd>
					</div>
				</dl>

				<h2 className="mt-12 text-[15px] font-medium text-text-hi">{d.measure.results}</h2>

				<div className="mt-4 flex flex-col">
					{d.measure.rows.map((row) => (
						<div key={row.id} className="border-b border-line py-6">
							<div className="flex items-baseline justify-between gap-6">
								<span className="text-[15px] text-text-hi">{row.k}</span>
								<span className="tnum shrink-0 font-[family-name:var(--font-mono)] text-[15px] text-text-hi">
									{values[row.id]}
								</span>
							</div>
							<p className="mt-2 max-w-xl text-[13px] leading-relaxed text-text-dim">{row.how}</p>
						</div>
					))}
				</div>

				<p className="mt-8 text-[13px] leading-relaxed text-text-dim">{d.measure.disclaimer}</p>

				<p className="mt-10 font-[family-name:var(--font-mono)] text-[11.5px] text-text-dim">
					{SITE.name} {SITE.version} · <time dateTime={SITE.releasedAt}>{formatDate(SITE.releasedAt, locale)}</time>
				</p>
			</div>
		</div>
	);
}
