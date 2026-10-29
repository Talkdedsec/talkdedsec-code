import type { MetadataRoute } from "next";
import { BASE, DEFAULT_LOCALE, SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${SITE.name} — ${SITE.tagline[DEFAULT_LOCALE]}`,
		short_name: SITE.name,
		description: SITE.tagline[DEFAULT_LOCALE],
		lang: DEFAULT_LOCALE,
		start_url: `${BASE}/${DEFAULT_LOCALE}/`,
		scope: `${BASE}/`,
		display: "standalone",
		background_color: "#0b0b0c",
		theme_color: "#0b0b0c",
		icons: [
			{ src: `${BASE}/icon`, sizes: "512x512", type: "image/png", purpose: "any" },
			{ src: `${BASE}/apple-icon`, sizes: "180x180", type: "image/png" },
		],
	};
}
