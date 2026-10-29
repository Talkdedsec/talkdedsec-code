import { Link } from "./link";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/site";
import { Mark } from "./mark";
import { LocaleSwitch } from "./locale-switch";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader({ locale }: { locale: Locale }) {
	const d = getDict(locale);

	const nav = [
		{ href: `/${locale}/#temalar`, label: d.nav.themes },
		{ href: `/${locale}/olcum/`, label: d.nav.metrics },
		{ href: `/${locale}/topluluk/`, label: d.meta.community },
		{ href: `/${locale}/topluluk/konular/`, label: d.forum.pageTitle },
		{ href: `/${locale}/belgeler/`, label: d.nav.docs },
	];

	return (
		<header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
			<div className="shell flex h-14 items-center justify-between gap-4">
				<Link href={`/${locale}/`} className="flex h-11 shrink-0 items-center gap-2.5" aria-label="Talkdedsec">
					<Mark className="h-6 w-6 text-text" />
					<span className="text-[15px] font-semibold tracking-tight text-text-hi">Talkdedsec</span>
				</Link>

				<nav className="hidden items-center gap-5 md:flex lg:gap-7" aria-label={d.meta.mainNav}>
					{nav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="link-underline py-3 text-[13.5px] text-text-mid transition-colors hover:text-text-hi"
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<LocaleSwitch locale={locale} />

					<Link
						href={`/${locale}/indir/`}
						className="inline-flex h-11 items-center rounded-[3px] bg-accent px-4 text-[13px] font-medium text-accent-ink transition-opacity hover:opacity-90 md:h-9"
					>
						{d.nav.download}
					</Link>

					<MobileMenu items={nav} menuLabel={d.meta.menu} navLabel={d.meta.mobileNav} />
				</div>
			</div>
		</header>
	);
}
