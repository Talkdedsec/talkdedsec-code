import { COMMUNITY_THEMES, getTheme } from "@/lib/community";
import { getDict, resolveLocale } from "@/lib/i18n";
import { OG_SIZE, renderOg } from "@/lib/og";
import { LOCALES } from "@/lib/site";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Talkdedsec";

export function generateStaticParams() {
	return LOCALES.flatMap((lang) => COMMUNITY_THEMES.map((t) => ({ lang, slug: t.slug })));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const theme = getTheme(slug);

	return renderOg({
		lang,
		title: theme?.name ?? getDict(locale).meta.community,
		subtitle: theme?.description[locale],
		path: `/topluluk/${slug}`,
	});
}
