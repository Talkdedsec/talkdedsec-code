"use client";

import type { CSSProperties } from "react";
import { Link } from "./link";
import { EditorFrame } from "./editor-frame";
import type { Dict } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { BASE, DOWNLOADS, METRICS, SITE, type Locale } from "@/lib/site";

export type HeroText = {
	hero: Dict["hero"];
	metrics: Pick<Dict["metrics"], "startup" | "processes">;
	editorPreview: Dict["meta"]["editorPreview"];
};

const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero({ locale, t }: { locale: Locale; t: HeroText }) {
	const lines = t.hero.title.split("\n");

	return (
		<section className="relative isolate overflow-hidden border-b border-line">
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] halftone" aria-hidden="true" />

			{/* eye-layer measures the eye's hero stop from this box; the still eye holds it until WebGL arrives */}
			<div
				data-eye-slot
				className="pointer-events-none absolute right-[-6%] top-[44vh] -z-10 hidden h-[78vh] w-[60%] -translate-y-1/2 lg:block"
				aria-hidden="true"
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={`${BASE}/logo.png`} alt="" className="eye-still absolute inset-0 m-auto w-[74%]" />
			</div>

			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={`${BASE}/logo.png`} alt="" aria-hidden="true" className="eye-mobile pointer-events-none absolute right-[-28%] top-[9%] -z-10 w-[92%] lg:hidden" />

			<div className="shell flex min-h-[calc(100svh-4rem)] flex-col justify-center pt-16 pb-14 md:pt-20">
				<p className="fade-up flex items-center gap-2.5 eyebrow font-[family-name:var(--font-mono)]" style={step(0)}>
					<span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
					{fill(t.hero.eyebrow, { v: SITE.version })}
				</p>

				<h1 className="display mt-7 max-w-[12ch] text-text-hi">
					{lines.map((line, i) => (
						<span key={line} className="line-mask">
							<span style={step(i)}>{line}</span>
						</span>
					))}
				</h1>

				<p className="fade-up mt-8 max-w-[34rem] text-pretty text-[17.5px] leading-[1.6] text-text-mid" style={step(3)}>
					{t.hero.lead}
				</p>

				<div className="fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={step(4)}>
					<a href={DOWNLOADS.windowsX64.primary} className="btn-brand px-7 py-4 text-[15.5px]">
						{t.hero.cta}
						<span className="font-[family-name:var(--font-mono)] text-[12px] font-medium opacity-70">
							{formatNumber(DOWNLOADS.windowsX64.sizeMB, locale)} MB
						</span>
						<span className="arrow" aria-hidden="true">
							↓
						</span>
					</a>
					<Link
						href={`/${locale}/olcum/`}
						className="link-underline inline-block py-3 text-[14.5px] text-text-mid transition-colors hover:text-text-hi"
					>
						{t.hero.secondary}
					</Link>
				</div>

				<dl
					className="fade-up mt-16 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-6 border-t border-line pt-6 sm:grid-cols-4"
					style={step(5)}
				>
					{[
						[t.metrics.startup, `${formatNumber(METRICS.startupSeconds, locale, 2)}s`],
						[t.metrics.processes, formatNumber(METRICS.processCount, locale)],
						[t.hero.telemetry, formatNumber(METRICS.telemetryEndpoints, locale)],
						[t.hero.version, SITE.version],
					].map(([k, v]) => (
						<div key={k} className="flex flex-col gap-1.5">
							<dt className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-chrome">{k}</dt>
							<dd className="tnum font-[family-name:var(--font-mono)] text-[22px] leading-none text-text-hi">{v}</dd>
						</div>
					))}
				</dl>
			</div>

			<div className="shell">
				<div className="rise-in origin-bottom">
					<EditorFrame
						theme="dark"
						locale={locale}
						label={t.editorPreview}
						className="overflow-hidden rounded-t-[6px] border-x border-t shadow-[0_-1px_120px_-24px_rgba(0,0,0,0.95)]"
					/>
				</div>
			</div>
		</section>
	);
}
