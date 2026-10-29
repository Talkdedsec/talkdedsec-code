import { BASE, DEFAULT_LOCALE } from "@/lib/site";

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
				<title>Talkdedsec</title>
			</head>
			<body style={{ background: "#0b0b0c" }} />
		</html>
	);
}
