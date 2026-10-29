import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { archivo, mono } from "../fonts";
import { LOCALES, SITE, type Locale } from "@/lib/site";
import { getDict, resolveLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeBoot } from "@/components/theme-boot";
import { RevealBoot } from "@/components/reveal-boot";
import { EyeLayer } from "@/components/eye-layer";
import { JsonLd } from "@/components/json-ld";

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
		metadataBase: new URL(SITE.url),
		title: {
			default: `${SITE.name} — ${SITE.tagline[locale]}`,
			template: `%s · ${SITE.name}`,
		},
		description: d.hero.lead,
		alternates: {
			canonical: `/${locale}/`,
			languages: {
				tr: "/tr/",
				en: "/en/",
				"x-default": "/tr/",
			},
		},
		openGraph: {
			type: "website",
			locale: locale === "tr" ? "tr_TR" : "en_US",
			alternateLocale: locale === "tr" ? "en_US" : "tr_TR",
			url: `${SITE.url}/${locale}/`,
			siteName: SITE.name,
			title: `${SITE.name} — ${SITE.tagline[locale]}`,
			description: d.hero.lead,
		},
		twitter: {
			card: "summary_large_image",
			title: `${SITE.name} — ${SITE.tagline[locale]}`,
			description: d.hero.lead,
		},
		robots: { index: true, follow: true },
	};
}

export default async function LangLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	if (!(LOCALES as readonly string[]).includes(lang)) {
		notFound();
	}
	const locale = resolveLocale(lang);
	const d = getDict(locale);

	return (
		<html lang={locale} className={`${archivo.variable} ${mono.variable}`} suppressHydrationWarning>
			{/* isolate şart: göz katmanı -z-10 ile body'nin kendi arka planının altına düşerse görünmez olur */}
			<body className="isolate font-[family-name:var(--font-display)] antialiased">
				<ThemeBoot />
				<RevealBoot />
				<EyeLayer locale={locale} guide={d.guide} />
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-accent focus:text-accent-ink focus:px-4 focus:py-2"
				>
					{d.meta.skip}
				</a>
				<SiteHeader locale={locale} />
				<main id="main" tabIndex={-1}>
					{children}
				</main>
				<SiteFooter locale={locale} />
				<JsonLd locale={locale} />
			</body>
		</html>
	);
}
