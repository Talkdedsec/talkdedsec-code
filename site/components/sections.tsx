import { getDict } from "@/lib/i18n";
import { fill, formatNumber } from "@/lib/format";
import { DOWNLOADS, METRICS, REMOVED_ENDPOINTS, SITE, type Locale } from "@/lib/site";

function SectionHead({ eyebrow, title, lead, wide }: { eyebrow?: string; title: string; lead: string; wide?: boolean }) {
	return (
		<div className={`reveal ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
			{eyebrow && (
				<p className="flex items-center gap-2.5 eyebrow font-[family-name:var(--font-mono)]">
					<span className="h-1 w-4 bg-brand" aria-hidden="true" />
					{eyebrow}
				</p>
			)}
			<h2
				className={`mt-5 text-balance font-semibold text-text-hi ${
					wide
						? "text-[clamp(2.2rem,5.6vw,4.6rem)] leading-[0.98] tracking-[-0.04em]"
						: "text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.05] tracking-[-0.03em]"
				}`}
			>
				{title}
			</h2>
			<p className="mt-5 max-w-xl text-pretty text-[16px] leading-[1.7] text-text-mid">{lead}</p>
		</div>
	);
}

const PROVIDERS = ["Claude Agent SDK", "Codex", "Copilot SDK"];

export function AgentSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line" id="ajan">
			<div className="shell grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-center">
				<div>
					<SectionHead eyebrow={d.agent.eyebrow} title={d.agent.title} lead={d.agent.lead} />
					<ul className="mt-9 flex flex-col">
						{d.agent.points.map((point, i) => (
							<li key={point} className="reveal flex gap-5 border-t border-line py-4 text-[15px] leading-relaxed text-text">
								<span className="tnum font-[family-name:var(--font-mono)] text-[12px] text-chrome">0{i + 1}</span>
								{point}
							</li>
						))}
					</ul>
				</div>

				<div className="reveal rounded-[6px] border border-line bg-bg-1">
					<div className="flex items-center justify-between border-b border-line px-6 py-4">
						<span className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.12em] text-text-dim">
							agent host
						</span>
						<span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11.5px] text-text-dim">
							<span className="h-1.5 w-1.5 rounded-full bg-text-dim" aria-hidden="true" />
							{d.agent.idle}
						</span>
					</div>
					<ul>
						{PROVIDERS.map((name) => (
							<li key={name} className="flex items-center justify-between border-b border-line px-6 py-5 last:border-b-0">
								<span className="text-[16px] font-medium text-text-hi">{name}</span>
								<span className="font-[family-name:var(--font-mono)] text-[11.5px] text-chrome">{d.agent.awaiting}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

export function PrivacySection({ locale }: { locale: Locale }) {
	const d = getDict(locale);
	const hosts = REMOVED_ENDPOINTS.map((e) => (e.note ? `${e.host} · ${e.note[locale]}` : e.host));

	return (
		<section className="relative overflow-hidden border-b border-line" id="gizlilik">
			<div className="shell section-y grid gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:items-end">
				<div className="reveal flex items-end gap-5">
					<span className="monument font-semibold text-text-hi" aria-hidden="true">
						{formatNumber(METRICS.telemetryEndpoints, locale)}
					</span>
					<span className="mb-[0.6em] h-3 w-3 shrink-0 rounded-full bg-brand" aria-hidden="true" />
				</div>
				<div>
					<SectionHead eyebrow={d.privacy.eyebrow} title={d.privacy.title} lead={d.privacy.lead} />
					<p className="reveal mt-6 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.12em] text-chrome">
						{formatNumber(METRICS.telemetryEndpoints, locale)} {d.privacy.counter}
					</p>
				</div>
			</div>

			<div className="ticker-mask border-t border-line py-6" role="region" aria-label={d.privacy.listTitle}>
				<p className="sr-only">{d.privacy.listTitle}</p>
				<div className="ticker">
					{[0, 1].map((copy) => (
						<ul key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
							{hosts.map((h) => (
								<li
									key={h}
									className="whitespace-nowrap px-8 font-[family-name:var(--font-mono)] text-[clamp(1rem,1.8vw,1.35rem)] text-text-dim"
								>
									<del className="decoration-brand/70 decoration-1">{h}</del>
								</li>
							))}
						</ul>
					))}
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
				<h2 className="reveal max-w-3xl text-balance text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-text-hi">
					{d.compare.title}
				</h2>

				<div className="mt-12 overflow-x-auto" tabIndex={0} role="region" aria-label={d.compare.title}>
					<table className="w-full min-w-[560px] border-collapse text-left">
						<thead>
							<tr className="border-b border-line-strong">
								<th scope="col" className="py-3 pr-6 text-[12px] font-normal uppercase tracking-[0.1em] text-text-dim">
									<span className="sr-only">{d.meta.criterion}</span>
								</th>
								<th scope="col" className="py-3 pr-6 font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-text-dim">
									{d.compare.vs}
								</th>
								<th scope="col" className="py-3 font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-brand">
									{d.compare.us}
								</th>
							</tr>
						</thead>
						<tbody>
							{d.compare.rows.map((row) => (
								<tr key={row.k} className="group border-b border-line transition-colors hover:bg-bg-1">
									<th scope="row" className="py-5 pr-6 text-left text-[15px] font-normal text-text-dim">
										{row.k}
									</th>
									<td className="py-5 pr-6 text-[15px] text-text-mid">{row.vs}</td>
									<td className="py-5 text-[17px] font-medium text-text-hi">
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

				<p className="mt-6 max-w-2xl text-[12.5px] leading-relaxed text-text-dim">{d.compare.note}</p>
			</div>
		</section>
	);
}

export function ExtensionsSection({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	return (
		<section className="section-y border-b border-line">
			<div className="shell grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] md:items-end">
				<SectionHead
					eyebrow={d.extensions.eyebrow}
					title={d.extensions.title}
					lead={fill(d.extensions.lead, {
						before: formatNumber(METRICS.extensionsBefore, locale),
						after: formatNumber(METRICS.extensions, locale),
					})}
				/>

				<div className="reveal flex items-end gap-10">
					<div className="flex flex-col gap-3">
						<span className="numeral font-[family-name:var(--font-mono)] font-medium text-text-hi">
							{formatNumber(METRICS.extensions, locale)}
						</span>
						<span className="text-[13px] text-text-mid">{d.extensions.label}</span>
					</div>
					<div className="flex flex-col gap-3">
						<span className="numeral font-[family-name:var(--font-mono)] font-medium text-text-dim/60 line-through decoration-brand/70 decoration-2">
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
		<section className="relative isolate overflow-hidden" id="indir">
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] halftone" aria-hidden="true" />
			<div className="shell section-y">
				<h2 className="reveal display max-w-[14ch] text-text-hi">{d.download.title}</h2>
				<p className="reveal mt-8 max-w-xl text-[17px] leading-[1.65] text-text-mid">{d.download.lead}</p>

				<div className="reveal mt-12 flex flex-col gap-8 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
					<div className="font-[family-name:var(--font-mono)] text-[13px] leading-[1.8] text-text-dim">
						<p className="text-[15px] text-text-hi">{DOWNLOADS.windowsX64.label}</p>
						<p>
							{DOWNLOADS.windowsX64.file} · {formatNumber(DOWNLOADS.windowsX64.sizeMB, locale)} MB · v{SITE.version}
						</p>
					</div>
					<a href={DOWNLOADS.windowsX64.primary} className="btn-brand self-start px-8 py-5 text-[16.5px] sm:self-auto">
						{d.nav.downloadFile}
						<span className="arrow" aria-hidden="true">
							↓
						</span>
					</a>
				</div>
			</div>
		</section>
	);
}
