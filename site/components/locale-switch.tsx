"use client";

import { Link } from "./link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/site";

/** Dil değiştirirken bulunulan sayfada kalır: /tr/belgeler -> /en/belgeler */
export function LocaleSwitch({ locale }: { locale: Locale }) {
	const pathname = usePathname() ?? `/${locale}/`;
	const other: Locale = locale === "tr" ? "en" : "tr";

	const segments = pathname.split("/").filter(Boolean);
	if ((LOCALES as readonly string[]).includes(segments[0])) {
		segments[0] = other;
	} else {
		segments.unshift(other);
	}
	const href = `/${segments.join("/")}/`;

	return (
		<Link
			href={href}
			hrefLang={other}
			lang={other}
			className="-mx-2 flex h-11 min-w-11 items-center justify-center px-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-text-dim transition-colors hover:text-text"
			aria-label={other === "en" ? "EN — Switch to English" : "TR — Türkçeye geç"}
		>
			{other.toUpperCase()}
		</Link>
	);
}
