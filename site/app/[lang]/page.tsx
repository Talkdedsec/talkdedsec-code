import { LOCALES } from "@/lib/site";
import { getDict, resolveLocale } from "@/lib/i18n";
import { Hero } from "@/components/hero";
import { Metrics } from "@/components/metrics";
import { ThemeDemo } from "@/components/theme-demo";
import {
	AgentSection,
	CompareSection,
	DownloadSection,
	ExtensionsSection,
	PrivacySection,
} from "@/components/sections";

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);

	return (
		<>
			<Hero
				locale={locale}
				t={{
					hero: d.hero,
					metrics: { startup: d.metrics.startup, processes: d.metrics.processes },
					editorPreview: d.meta.editorPreview,
				}}
			/>
			<Metrics locale={locale} t={d.metrics} />
			<ThemeDemo
				locale={locale}
				t={{ themes: d.themes, themeSelect: d.meta.themeSelect, editorPreview: d.meta.editorPreview }}
			/>
			<AgentSection locale={locale} />
			<PrivacySection locale={locale} />
			<ExtensionsSection locale={locale} />
			<CompareSection locale={locale} />
			<DownloadSection locale={locale} />
		</>
	);
}
