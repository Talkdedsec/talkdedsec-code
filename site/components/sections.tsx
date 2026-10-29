import { getDict } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { DOWNLOADS, METRICS, REMOVED_ENDPOINTS, SITE, type Locale } from "@/lib/site";

function SectionHead({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead: string }) {
	return (
		<div className="max-w-2xl reveal">
			{eyebrow && <p className="eyebrow font-[family-name:var(--font-mono)]">{eyebrow}</p>}
			<h2 className="mt-4 text-balance text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
				{title}
			</h2>
			<p className="mt-4 text-pretty text-[15.5px] leading-[1.7] text-text-mid">{lead}</p>
		</div>
	);
}

export function AgentSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line" id="ajan">
			<div className="shell grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:items-center">
				<div>
					<SectionHead eyebrow={d.agent.eyebrow} title={d.agent.title} lead={d.agent.lead} />
					<ul className="mt-8 flex flex-col gap-3.5">
						{d.agent.points.map((point) => (
							<li key={point} className="flex gap-3 text-[14.5px] leading-relaxed text-text">
								<span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-text-dim" aria-hidden="true" />
								{point}
							</li>
						))}
					</ul>
				</div>

				<div className="reveal rounded-[3px] border border-line bg-bg-1 p-6">
					<div className="flex items-center justify-between border-b border-line pb-4">
						<span className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.12em] text-text-dim">
							agent host
						</span>
						<span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11.5px] text-ok">
							<span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
							active
						</span>
					</div>
					<pre className="mt-5 overflow-x-auto font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.75] text-text-mid">
						<code>{`"agents": [{
  "provider": "claude",
  "runtime": "embedded"
}]

agent.useProxy    false
telemetry.level   off
update.mode       none`}</code>
					</pre>
				</div>
			</div>
		</section>
	);
}

export function PrivacySection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line" id="gizlilik">
			<div className="shell">
				<SectionHead eyebrow={d.privacy.eyebrow} title={d.privacy.title} lead={d.privacy.lead} />

				<div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
					<div className="reveal flex items-center gap-6 rounded-[3px] border border-line bg-bg-1 px-7 py-8">
						<span className="tnum font-[family-name:var(--font-mono)] text-[clamp(3rem,7vw,4.5rem)] font-medium leading-none text-text-hi">
							{formatNumber(METRICS.telemetryEndpoints, locale)}
						</span>
						<span className="text-[14px] leading-snug text-text-mid">{d.privacy.counter}</span>
					</div>

					<div className="reveal">
						<p className="eyebrow font-[family-name:var(--font-mono)]">{d.privacy.listTitle}</p>
						<ul className="mt-4 flex flex-col gap-2">
							{REMOVED_ENDPOINTS.map((endpoint) => (
								<li
									key={endpoint.host}
									className="flex items-start gap-3 font-[family-name:var(--font-mono)] text-[12.5px] text-text-dim"
								>
									<span className="text-err" aria-hidden="true">
										—
									</span>
									<span className="min-w-0 wrap-anywhere">
										<del className="line-through decoration-line-strong">{endpoint.host}</del>
										{endpoint.note && <> ({endpoint.note[locale]})</>}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}

export function CompareSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line">
			<div className="shell">
				<h2 className="max-w-2xl text-balance text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi reveal">
					{d.compare.title}
				</h2>

				<div className="mt-10 overflow-x-auto" tabIndex={0} role="region" aria-label={d.compare.title}>
					<table className="w-full min-w-[560px] border-collapse text-left">
						<thead>
							<tr className="border-b border-line-strong">
								<th scope="col" className="py-3 pr-6 text-[12px] font-normal uppercase tracking-[0.1em] text-text-dim">
									<span className="sr-only">{d.meta.criterion}</span>
								</th>
								<th scope="col" className="py-3 pr-6 font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-text-dim">
									{d.compare.vs}
								</th>
								<th scope="col" className="py-3 font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-text-hi">
									{d.compare.us}
								</th>
							</tr>
						</thead>
						<tbody>
							{d.compare.rows.map((row) => (
								<tr key={row.k} className="border-b border-line">
									<th scope="row" className="py-4 pr-6 text-left text-[14px] font-normal text-text-dim">
										{row.k}
									</th>
									<td className="py-4 pr-6 text-[14px] text-text-mid">{row.vs}</td>
									<td className="py-4 text-[14px] text-text-hi">
										{fill(row.us, {
											startup: formatNumber(METRICS.startupSeconds, locale, 2),
											processes: formatNumber(METRICS.processCount, locale),
											installer: formatNumber(METRICS.installerMB, locale),
											extensions: formatNumber(METRICS.extensions, locale),
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<p className="mt-5 max-w-2xl text-[12.5px] leading-relaxed text-text-dim">{d.compare.note}</p>
			</div>
		</section>
	);
}

export function ExtensionsSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line">
			<div className="shell grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] md:items-end">
				<SectionHead
					eyebrow={d.extensions.eyebrow}
					title={d.extensions.title}
					lead={fill(d.extensions.lead, {
						before: formatNumber(METRICS.extensionsBefore, locale),
						after: formatNumber(METRICS.extensions, locale),
					})}
				/>

				<div className="reveal flex gap-10">
					<div className="flex flex-col gap-1.5">
						<span className="tnum font-[family-name:var(--font-mono)] text-[2.6rem] font-medium leading-none text-text-hi">
							{formatNumber(METRICS.extensions, locale)}
						</span>
						<span className="text-[13px] text-text-mid">{d.extensions.label}</span>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="tnum font-[family-name:var(--font-mono)] text-[2.6rem] font-medium leading-none text-text-dim line-through decoration-line-strong">
							{formatNumber(METRICS.extensionsBefore, locale)}
						</span>
						<span className="text-[13px] text-text-mid">{d.extensions.before}</span>
					</div>
				</div>
			</div>
		</section>
	);
}

export function DownloadSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y" id="indir">
			<div className="shell">
				<div className="max-w-2xl reveal">
					<h2 className="text-balance text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
						{d.download.title}
					</h2>
					<p className="mt-4 text-[15.5px] leading-[1.7] text-text-mid">{d.download.lead}</p>
				</div>

				<div className="reveal mt-10 flex flex-col gap-4 rounded-[3px] border border-line bg-bg-1 p-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-[15px] font-medium text-text-hi">{DOWNLOADS.windowsX64.label}</p>
						<p className="mt-1 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
							{DOWNLOADS.windowsX64.file} · {formatNumber(DOWNLOADS.windowsX64.sizeMB, locale)} MB · {SITE.version}
						</p>
					</div>
					<div className="flex items-center gap-4">
						<a
							href={DOWNLOADS.windowsX64.primary}
							className="inline-flex min-h-11 items-center rounded-[3px] bg-accent px-5 text-[14px] font-medium text-accent-ink transition-opacity hover:opacity-90"
						>
							{d.nav.downloadFile}
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
