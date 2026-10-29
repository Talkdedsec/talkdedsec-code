import { ImageResponse } from "next/og";
import { METRICS, SITE } from "./site";
import { formatNumber } from "./format";
import { getDict, resolveLocale } from "./i18n";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgOptions {
	lang: string;
	title?: string;
	subtitle?: string;
	/** sağ altta gösterilen yol, ör. /belgeler */
	path?: string;
}

export function renderOg({ lang, title, subtitle, path }: OgOptions) {
	const locale = resolveLocale(lang);
	const d = getDict(locale);

	const stats = [
		{ v: `${formatNumber(METRICS.startupSeconds, locale, 2)}s`, l: d.metrics.startup },
		{ v: formatNumber(METRICS.processCount, locale), l: d.metrics.processes },
		{ v: formatNumber(METRICS.telemetryEndpoints, locale), l: d.hero.telemetry },
	];

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					background: "#0b0b0c",
					padding: "68px 72px",
					fontFamily: "sans-serif",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
					<div style={{ display: "flex", gap: 5 }}>
						{[0.9, 0.55, 0.3].map((o, i) => (
							<div
								key={i}
								style={{ width: 11, height: 11, borderRadius: 999, background: "#c9cdd4", opacity: o }}
							/>
						))}
					</div>
					<div style={{ fontSize: 25, color: "#f2f3f5", letterSpacing: -0.4 }}>Talkdedsec</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							fontSize: title ? 62 : 70,
							lineHeight: 1.05,
							color: "#f2f3f5",
							letterSpacing: -2,
							maxWidth: 940,
							display: "flex",
						}}
					>
						{title ?? `${SITE.tagline[locale]}.`}
					</div>
					<div style={{ marginTop: 26, fontSize: 26, color: "#9ba1aa", maxWidth: 840, display: "flex" }}>
						{subtitle ?? d.meta.ogSubtitle}
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
					<div style={{ display: "flex", gap: 52 }}>
						{stats.map((s) => (
							<div key={s.l} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
								<div style={{ fontSize: 40, color: "#f2f3f5" }}>{s.v}</div>
								<div style={{ fontSize: 19, color: "#868d97" }}>{s.l}</div>
							</div>
						))}
					</div>
					<div style={{ fontSize: 21, color: "#868d97" }}>{`${SITE.domain}${path ?? ""}`}</div>
				</div>
			</div>
		),
		OG_SIZE
	);
}
