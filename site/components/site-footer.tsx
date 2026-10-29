import { Link } from "./link";
import { getDict } from "@/lib/i18n";
import { SITE, type Locale } from "@/lib/site";
import { Mark } from "./mark";

export function SiteFooter({ locale }: { locale: Locale }) {
	const d = getDict(locale);
	// min-h-11 dokunma kutuları sütun boşluğundan büyük olduğu için sütun gap'siz dizilir, yoksa komşular çakışır
	const item = "inline-flex min-h-11 items-center text-text-mid hover:text-text-hi";

	return (
		<footer className="border-t border-line">
			<div className="shell flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
				<div className="max-w-sm">
					<div className="flex items-center gap-2.5">
						<Mark className="h-5 w-5 text-chrome" />
						<span className="text-sm font-semibold text-text-hi">Talkdedsec</span>
					</div>
					<p className="mt-3 text-[13px] leading-relaxed text-text-dim">
						{d.footer.built} · {SITE.version}
					</p>
				</div>

				<nav className="flex flex-wrap gap-x-10 gap-y-6 text-[13px]" aria-label={d.meta.footerNav}>
					<div className="flex flex-col">
						<span className="eyebrow mb-1.5 font-[family-name:var(--font-mono)]">
							{d.meta.product}
						</span>
						<Link href={`/${locale}/#temalar`} className={item}>
							{d.nav.themes}
						</Link>
						<Link href={`/${locale}/olcum/`} className={item}>
							{d.nav.metrics}
						</Link>
						<Link href={`/${locale}/belgeler/`} className={item}>
							{d.nav.docs}
						</Link>
						<Link href={`/${locale}/indir/`} className={item}>
							{d.nav.download}
						</Link>
					</div>

					<div className="flex flex-col">
						<span className="eyebrow mb-1.5 font-[family-name:var(--font-mono)]">
							{d.meta.source}
						</span>
						<a href={SITE.repo} className={item}>
							GitHub
						</a>
						<Link href={`/${locale}/topluluk/`} className={item}>
							{d.meta.community}
						</Link>
						<Link href={`/${locale}/topluluk/konular/`} className={item}>
							{d.forum.pageTitle}
						</Link>
						<a href={SITE.themesRepo} className={item}>
							{d.footer.themes}
						</a>
					</div>
				</nav>
			</div>

			<div className="shell border-t border-line py-6">
				<p className="font-[family-name:var(--font-mono)] text-[11px] text-chrome">
					<a
						href={`${SITE.repo}/blob/main/LICENSE.txt`}
						className="link-underline -my-3 inline-block py-3 hover:text-text"
					>
						{d.footer.license}
					</a>{" "}
					· {SITE.domain}
				</p>
			</div>
		</footer>
	);
}
