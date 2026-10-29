import { getDict } from "@/lib/i18n";
import { DOWNLOADS, METRICS, SITE, type Locale } from "@/lib/site";

export function JsonLd({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	const graph = [
		{
			"@type": "SoftwareApplication",
			"@id": `${SITE.url}/#app`,
			name: SITE.name,
			applicationCategory: "DeveloperApplication",
			applicationSubCategory: "Code editor",
			operatingSystem: "Windows 10, Windows 11",
			softwareVersion: SITE.version,
			datePublished: SITE.releasedAt,
			fileSize: `${DOWNLOADS.windowsX64.sizeMB}MB`,
			downloadUrl: DOWNLOADS.windowsX64.primary,
			installUrl: `${SITE.url}/${locale}/indir/`,
			description: d.hero.lead,
			inLanguage: locale,
			license: `${SITE.repo}/blob/main/LICENSE.txt`,
			isAccessibleForFree: true,
			offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
			featureList: d.agent.points,
		},
		{
			"@type": "WebSite",
			"@id": `${SITE.url}/#site`,
			url: `${SITE.url}/${locale}/`,
			name: SITE.name,
			description: SITE.tagline[locale],
			inLanguage: locale,
			about: { "@id": `${SITE.url}/#app` },
		},
		{
			"@type": "Dataset",
			"@id": `${SITE.url}/#metrics`,
			name: d.measure.title,
			description: d.measure.metaDesc,
			url: `${SITE.url}/${locale}/olcum/`,
			inLanguage: locale,
			variableMeasured: [
				{ "@type": "PropertyValue", name: d.metrics.startup, value: METRICS.startupSeconds, unitText: "s" },
				{ "@type": "PropertyValue", name: d.metrics.processes, value: METRICS.processCount },
				{ "@type": "PropertyValue", name: d.metrics.installer, value: METRICS.installerMB, unitText: "MB" },
			],
		},
	];

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
		/>
	);
}
