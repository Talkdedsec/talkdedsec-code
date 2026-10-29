import { LOCALES } from "@/lib/site";
import { OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Talkdedsec";

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }));
}

export default async function OgImage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	return renderOg({ lang });
}
