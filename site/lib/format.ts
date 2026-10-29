import type { Locale } from "./site";

const NUMBER_LOCALE: Record<Locale, string> = { tr: "tr-TR", en: "en-US" };

export function formatNumber(value: number, locale: Locale, decimals = 0) {
	return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

export function formatDate(iso: string, locale: Locale) {
	const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
	return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(Date.UTC(y, m - 1, day));
}

export function fill(template: string, values: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (match, key) =>
		key in values ? String(values[key]) : match,
	);
}
