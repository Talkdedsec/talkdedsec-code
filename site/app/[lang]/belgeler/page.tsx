import type { Metadata } from "next";
import { Link } from "@/components/link";
import { getDict, resolveLocale } from "@/lib/i18n";
import { DOWNLOADS, LOCALES, SITE, THEMES, type Locale } from "@/lib/site";

export function generateStaticParams() {
	return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	return {
		title: d.docs.pageTitle,
		description: d.docs.metaDesc,
		alternates: {
			canonical: `/${locale}/belgeler/`,
			languages: { tr: "/tr/belgeler/", en: "/en/belgeler/", "x-default": "/tr/belgeler/" },
		},
		openGraph: {
			type: "website",
			url: `${SITE.url}/${locale}/belgeler/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${d.docs.pageTitle} — ${SITE.name}`,
			description: d.docs.metaDesc,
		},
		twitter: { card: "summary_large_image", title: `${d.docs.pageTitle} — ${SITE.name}`, description: d.docs.metaDesc },
	};
}

function Kbd({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="rounded-[3px] border border-line-strong bg-bg-2 px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[11.5px] text-text">
			{children}
		</kbd>
	);
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[15px] leading-[1.72] text-text-mid">{children}</p>;
}

function Mono({ children }: { children: React.ReactNode }) {
	return <code className="font-[family-name:var(--font-mono)] text-[13.5px] text-text">{children}</code>;
}

export default async function BelgelerPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale: Locale = resolveLocale(lang);
	const d = getDict(locale);
	const tr = locale === "tr";
	const themeNames = THEMES.map((t) => t.settingsId.replace("Talkdedsec ", "")).join(", ");

	const sections = [
		{
			id: tr ? "kurulum" : "install",
			title: tr ? "Kurulum" : "Installation",
			body: (
				<>
					<P>
						{tr
							? "Kurulum dosyasını indir ve çalıştır. Yönetici hakkı istemez; her şey kullanıcı klasörüne kurulur. Windows SmartScreen uyarısı çıkarsa “Daha fazla bilgi → Yine de çalıştır” diyebilirsin — paket imzalı değil."
							: "Download the installer and run it. No administrator rights needed; everything goes into your user folder. If Windows SmartScreen warns you, choose “More info → Run anyway” — the package is unsigned."}
					</P>
					<pre className="mt-1 overflow-x-auto rounded-[3px] border border-line bg-bg-1 p-4">
						<code className="font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.7] text-text-mid">
							{`%LOCALAPPDATA%\\Programs\\Talkdedsec\\Talkdedsec.exe`}
						</code>
					</pre>
					<P>
						{tr ? "PATH'e eklendiyse terminalden " : "If added to PATH, open the current folder with "}
						<Mono>talkdedsec .</Mono>
						{tr ? " yazarak bulunduğun klasörü açabilirsin." : " from a terminal."}
					</P>
				</>
			),
		},
		{
			id: tr ? "yan-yana" : "alongside",
			title: tr ? "Mevcut editörünle yan yana" : "Alongside your current editor",
			body: (
				<P>
					{tr ? "Ayarların, eklentilerin ve oturum geçmişin " : "Settings, extensions and session history live in a "}
					<Mono>.talkdedsec</Mono>
					{tr
						? " klasöründe tutulur — mevcut editörünün ayarlarına dokunmaz. İkisini aynı anda açık tutabilir, aynı projede çalışabilirsin. Eklentiler Open VSX üzerinden gelir; Marketplace'e özel bazı eklentiler (C#, Pylance, Remote-*) orada bulunmaz."
						: " folder and never touch your existing editor's setup. You can run both at once on the same project. Extensions come from Open VSX; a few Marketplace-only ones (C#, Pylance, Remote-*) aren't available there."}
				</P>
			),
		},
		{
			id: tr ? "ajan" : "agent",
			title: tr ? "Ajanı bağlama" : "Connecting the agent",
			body: (
				<>
					<P>
						{tr
							? "Ajan editörün içine gömülü çalışır — ayrıca bir eklenti kurman gerekmez. Kendi hesabınla bağlanırsın; araya bir aracı servis girmez."
							: "The agent runs inside the editor — there is no extension to install. You connect with your own account; no intermediary service sits in the path."}
					</P>
					<P>
						<Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>J</Kbd>{" "}
						{tr
							? "yeni bir oturum açar. Ajan oturumları için ayrı bir pencere de vardır."
							: "starts a session. There is also a dedicated window for agent sessions."}
					</P>
				</>
			),
		},
		{
			id: tr ? "tema-yazma" : "writing-themes",
			title: tr ? "Tema yazma" : "Writing themes",
			body: (
				<>
					<P>
						{tr ? `Kurulumla birlikte ${THEMES.length} tema gelir: ${themeNames}. Değiştirmek için ` : `${THEMES.length} themes ship with the editor: ${themeNames}. Switch with `}
						<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> {tr ? "ardından" : "then"} <Kbd>Ctrl</Kbd> + <Kbd>T</Kbd>.
					</P>
					<P>
						{tr ? "Kendi temanı üretmek için " : "To build your own, generate one from your current settings: "}
						<Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> → “Generate Color Theme From Current Settings”
						{tr ? ". Çıkan dosyayı " : ", then "}
						<Link href={`/${locale}/topluluk/`} className="link-underline text-text hover:text-text-hi">
							{tr ? "toplulukla paylaşabilirsin" : "share it with the community"}
						</Link>
						.
					</P>
				</>
			),
		},
		{
			id: tr ? "kisayollar" : "shortcuts",
			title: tr ? "Kısayollar" : "Shortcuts",
			body: (
				<div className="mt-2 flex flex-col">
					{d.docs.shortcuts.map(([k, v]) => (
						<div key={k} className="flex items-center justify-between gap-6 border-b border-line py-3">
							<span className="text-[14.5px] text-text-mid">{v}</span>
							<span className="shrink-0 font-[family-name:var(--font-mono)] text-[12.5px] text-text">{k}</span>
						</div>
					))}
				</div>
			),
		},
		{
			id: tr ? "guncelleme" : "updates",
			title: tr ? "Güncelleme" : "Updates",
			body: (
				<P>
					{tr
						? "Otomatik güncelleme yoktur — editör açılışta hiçbir sunucuya bağlanmaz. Yeni sürüm çıktığında "
						: "There is no auto-update — the editor contacts no server at startup. When a new version ships, install it from the "}
					<Link href={`/${locale}/indir/`} className="link-underline text-text hover:text-text-hi">
						{tr ? "indirme sayfasından" : "download page"}
					</Link>
					{tr ? " kurabilirsin; üzerine kurulum ayarlarını korur." : "; it keeps your settings."}
				</P>
			),
		},
	];

	return (
		<div className="section-y">
			<div className="shell grid gap-14 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
				<nav className="hidden lg:block" aria-label={d.meta.toc}>
					<div className="sticky top-24 flex flex-col gap-2.5">
						<span className="eyebrow font-[family-name:var(--font-mono)]">{d.meta.toc}</span>
						{sections.map((s) => (
							<a
								key={s.id}
								href={`#${s.id}`}
								className="link-underline w-fit text-[13.5px] text-text-mid hover:text-text-hi"
							>
								{s.title}
							</a>
						))}
					</div>
				</nav>

				<div className="min-w-0 max-w-2xl">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{d.docs.pageTitle}</p>
					<h1 className="mt-4 text-balance page-title fade-up text-text-hi">
						{d.docs.title}
					</h1>
					<p className="mt-5 text-[16.5px] leading-[1.68] text-text-mid">
						{d.docs.lead} {SITE.version}.
					</p>

					<div className="mt-14 flex flex-col gap-14">
						{sections.map((s) => (
							<section key={s.id} id={s.id} className="scroll-mt-24">
								<h2 className="text-[20px] font-semibold tracking-[-0.01em] text-text-hi">{s.title}</h2>
								<div className="mt-4 flex flex-col gap-4">{s.body}</div>
							</section>
						))}
					</div>

					<div className="mt-16 rounded-[3px] border border-line bg-bg-1 p-6">
						<p className="text-[14.5px] leading-relaxed text-text-mid">
							{d.docs.help}{" "}
							<a href={SITE.repo} className="link-underline text-text hover:text-text-hi">
								{d.docs.helpLink}
							</a>{" "}
							{d.docs.helpOr}{" "}
							<a href={DOWNLOADS.windowsX64.primary} className="link-underline text-text hover:text-text-hi">
								{d.docs.helpDownload}
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
