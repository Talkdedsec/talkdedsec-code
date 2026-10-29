import { FORUM, getTopic } from "@/lib/forum";
import { getDict, resolveLocale } from "@/lib/i18n";
import { OG_SIZE, renderOg } from "@/lib/og";
import { LOCALES } from "@/lib/site";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Talkdedsec";

// output:export boş listeyi "generateStaticParams eksik" sayıp derlemeyi kırar; konu yokken yer tutucu şart.
export function generateStaticParams() {
	if (FORUM.topics.length === 0) return LOCALES.map((lang) => ({ lang, slug: "yok" }));
	return LOCALES.flatMap((lang) => FORUM.topics.map((t) => ({ lang, slug: t.slug })));
}

export default async function Image({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	const topic = getTopic(slug);

	return renderOg({
		lang,
		title: topic?.title ?? d.forum.pageTitle,
		subtitle: topic ? d.forum.categories[topic.category].ad : d.forum.metaDesc,
		path: `/topluluk/konular/${slug}`,
	});
}
