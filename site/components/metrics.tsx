"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "./link";
import type { Dict } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import { METRICS, type Locale } from "@/lib/site";

/** Sunucuda hedef değer basılır; sıfırlama yalnızca istemcide olur — JS'siz ziyaretçi "0.00" görmemeli. */
function useCountUp(target: number, active: boolean) {
	const [value, setValue] = useState(target);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (!active) {
			setValue(0);
			return;
		}
		let raf = 0;
		const start = performance.now();
		const dur = 1100;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - t, 4);
			setValue(target * eased);
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [target, active]);

	return value;
}

function Stat({
	value,
	decimals,
	unit,
	label,
	active,
	locale,
}: {
	value: number;
	decimals: number;
	unit: string;
	label: string;
	active: boolean;
	locale: Locale;
}) {
	const shown = formatNumber(useCountUp(value, active), locale, decimals);

	return (
		<div className="flex flex-col gap-2 border-l border-line pl-5">
			<div className="flex items-baseline gap-1.5">
				<span className="tnum font-[family-name:var(--font-mono)] text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-none text-text-hi">
					{shown}
				</span>
				<span className="font-[family-name:var(--font-mono)] text-[13px] text-chrome">{unit}</span>
			</div>
			<span className="text-[13px] text-text-dim">{label}</span>
		</div>
	);
}

export function Metrics({ locale, t }: { locale: Locale; t: Dict["metrics"] }) {
	const ref = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setActive(true);
					io.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		io.observe(el);

		const fallback = window.setTimeout(() => setActive(true), 2500);

		return () => {
			io.disconnect();
			window.clearTimeout(fallback);
		};
	}, []);

	return (
		<section className="section-y border-b border-line" id="olcum">
			<div className="shell">
				<div className="max-w-2xl reveal">
					<h2 className="text-balance text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
						{t.title}
					</h2>
					<p className="mt-4 text-pretty text-[15.5px] leading-[1.7] text-text-mid">{t.lead}</p>
				</div>

				<div ref={ref} className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
					<Stat value={METRICS.startupSeconds} decimals={2} unit="s" label={t.startup} active={active} locale={locale} />
					<Stat value={METRICS.processCount} decimals={0} unit="" label={t.processes} active={active} locale={locale} />
					<Stat value={METRICS.memoryMB / 1024} decimals={2} unit="GB" label={t.memory} active={active} locale={locale} />
					<Stat value={METRICS.installerMB} decimals={0} unit="MB" label={t.installer} active={active} locale={locale} />
				</div>

				<div className="rule-dots mt-12" aria-hidden="true" />

				<Link
					href={`/${locale}/olcum/`}
					className="link-underline mt-3 inline-flex min-h-11 items-center py-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.1em] text-chrome hover:text-text"
				>
					{t.link}
				</Link>
			</div>
		</section>
	);
}
