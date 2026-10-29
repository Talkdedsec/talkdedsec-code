import type { MetadataRoute } from "next";
import { COMMUNITY_THEMES } from "@/lib/community";
import { FORUM } from "@/lib/forum";
import { DEFAULT_LOCALE, LOCALES, SITE } from "@/lib/site";

export const dynamic = "force-static";

const PAGES = [
	"",
	"/indir",
	"/olcum",
	"/topluluk",
	"/belgeler",
	...COMMUNITY_THEMES.map((t) => `/topluluk/${t.slug}`),
	"/topluluk/konular",
	...FORUM.topics.map((t) => `/topluluk/konular/${t.slug}`),
];

const href = (lang: string, page: string) => `${SITE.url}/${lang}${page}/`;

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date(`${SITE.releasedAt}T00:00:00Z`);

	return LOCALES.flatMap((lang) =>
		PAGES.map((page) => ({
			url: href(lang, page),
			lastModified,
			changeFrequency: "monthly" as const,
			priority: page === "" ? 1 : 0.7,
			alternates: {
				languages: {
					...Object.fromEntries(LOCALES.map((l) => [l, href(l, page)])),
					"x-default": href(DEFAULT_LOCALE, page),
				},
			},
		})),
	);
}
