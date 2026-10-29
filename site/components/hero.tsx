"use client";

import { Link } from "./link";
import { EditorFrame } from "./editor-frame";
import type { Dict } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { DOWNLOADS, METRICS, SITE, type Locale } from "@/lib/site";

export type HeroText = {
	hero: Dict["hero"];
	metrics: Pick<Dict["metrics"], "startup" | "processes">;
	editorPreview: Dict["meta"]["editorPreview"];
};

export function Hero({ locale, t }: { locale: Locale; t: HeroText }) {
	return (
		<section className="relative isolate overflow-hidden border-b border-line">
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] halftone" aria-hidden="true" />

			{/* boş ama silinemez: eye-layer gözün hero durağını bu kutudan ölçüyor */}
			<div
				data-eye-slot
				className="pointer-events-none absolute right-[2%] top-[33%] -z-10 hidden h-[58%] w-[50%] -translate-y-1/2 lg:block"
				aria-hidden="true"
			/>

			<div className="shell pt-16 pb-0 md:pt-24">
				<div className="max-w-3xl">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{fill(t.hero.eyebrow, { v: SITE.version })}</p>

					<h1 className="mt-5 text-balance text-[clamp(2.6rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-text-hi">
						{t.hero.title}
					</h1>

					<p className="mt-6 max-w-xl text-pretty text-[17px] leading-[1.65] text-text-mid">
						{t.hero.lead}
					</p>

					<div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
						<a
							href={DOWNLOADS.windowsX64.primary}
							className="inline-flex items-center gap-2.5 rounded-[3px] bg-accent px-6 py-3.5 text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90"
						>
							{t.hero.cta}
							<span className="font-[family-name:var(--font-mono)] text-[12px] opacity-70">
								{formatNumber(DOWNLOADS.windowsX64.sizeMB, locale)} MB
							</span>
						</a>
						<Link
							href={`/${locale}/olcum/`}
							className="link-underline inline-block py-3 text-[14.5px] text-text-mid transition-colors hover:text-text-hi"
						>
							{t.hero.secondary}
						</Link>
					</div>

					<dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
						<div className="flex items-center gap-2">
							<dt>{t.metrics.startup}</dt>
							<dd className="tnum text-text">{formatNumber(METRICS.startupSeconds, locale, 2)}s</dd>
						</div>
						<div className="flex items-center gap-2">
							<dt>{t.metrics.processes}</dt>
							<dd className="tnum text-text">{formatNumber(METRICS.processCount, locale)}</dd>
						</div>
						<div className="flex items-center gap-2">
							<dt>{t.hero.telemetry}</dt>
							<dd className="tnum text-text">{formatNumber(METRICS.telemetryEndpoints, locale)}</dd>
						</div>
						<div className="flex items-center gap-2">
							<dt>{t.hero.version}</dt>
							<dd className="tnum text-text">{SITE.version}</dd>
						</div>
					</dl>
				</div>

				<div className="relative mt-14 md:mt-20">
					<EditorFrame
						theme="dark"
						locale={locale}
						label={t.editorPreview}
						className="overflow-hidden rounded-t-[4px] border-x border-t shadow-[0_-1px_80px_-24px_rgba(0,0,0,0.95)]"
					/>
				</div>
			</div>
		</section>
	);
}
