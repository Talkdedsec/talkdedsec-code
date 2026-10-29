import { BASE, DEFAULT_LOCALE, SITE } from "@/lib/site";

// GitHub Pages has no server redirects: the root picks the visitor's language and moves on.
export default function Root() {
	const fallback = `${BASE}/${DEFAULT_LOCALE}/`;
	const pick = `location.replace(${JSON.stringify(BASE)}+(/^tr\\b/i.test(navigator.language)?"/tr/":"/en/"))`;
	return (
		<html lang={DEFAULT_LOCALE}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: pick }} />
				<meta httpEquiv="refresh" content={`0; url=${fallback}`} />
				<link rel="canonical" href={fallback} />
				<title>{`${SITE.name} — ${SITE.tagline.en}`}</title>
				{/* the repository links here, so the share card must not depend on the redirect */}
				<meta name="description" content="A code editor built on an open-source core, with everything you do not use stripped out and telemetry off." />
				<meta property="og:title" content={`${SITE.name} — ${SITE.tagline.en}`} />
				<meta property="og:url" content={`${SITE.url}/`} />
				<meta property="og:image" content={`${SITE.url}/en/opengraph-image.png`} />
				<meta name="twitter:card" content="summary_large_image" />
			</head>
			<body style={{ background: "#0b0b0c" }} />
		</html>
	);
}
