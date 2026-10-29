import type { Metadata } from "next";
import { Link } from "@/components/link";
import { formatDate, formatNumber } from "@/lib/format";
import {
	CATEGORIES,
	DISCUSSIONS_URL,
	FORUM,
	newTopicUrl,
	topicPath,
	topicsByCategory,
} from "@/lib/forum";
import { getDict, resolveLocale } from "@/lib/i18n";
import { LOCALES, SITE } from "@/lib/site";

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
		title: d.forum.pageTitle,
		description: d.forum.metaDesc,
		alternates: {
			canonical: `/${locale}/topluluk/konular/`,
			languages: {
				tr: "/tr/topluluk/konular/",
				en: "/en/topluluk/konular/",
				"x-default": "/tr/topluluk/konular/",
			},
		},
		openGraph: {
			type: "website",
			url: `${SITE.url}/${locale}/topluluk/konular/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${d.forum.pageTitle} — ${SITE.name}`,
			description: d.forum.metaDesc,
		},
		twitter: {
			card: "summary_large_image",
			title: `${d.forum.pageTitle} — ${SITE.name}`,
			description: d.forum.metaDesc,
		},
	};
}

export default async function KonularPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	const topics = FORUM.topics;

	return (
		<>
			<section className="border-b border-line">
				<div className="shell pt-16 pb-14 md:pt-24 md:pb-20">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{d.forum.eyebrow}</p>
					<h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.2rem,4.6vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-text-hi">
						{d.forum.title}
					</h1>
					<p className="mt-5 max-w-xl text-pretty text-[16.5px] leading-[1.68] text-text-mid">
						{d.forum.lead}
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<a
							href={newTopicUrl()}
							rel="noopener"
							className="inline-flex min-h-11 items-center rounded-[3px] bg-accent px-5 py-3 text-[14.5px] font-medium text-accent-ink transition-opacity hover:opacity-90"
						>
							{d.forum.newTopic}
						</a>
						<a
							href={DISCUSSIONS_URL}
							rel="noopener"
							className="inline-flex min-h-11 items-center rounded-[3px] border border-line px-5 py-3 text-[14.5px] text-text-mid transition-colors hover:border-line-strong hover:text-text-hi"
						>
							{d.forum.openOnGithub}
						</a>
					</div>
				</div>
			</section>

			<section className="section-y border-b border-line">
				<div className="shell">
					<ul className="grid gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
						{CATEGORIES.map((c) => {
							const cat = d.forum.categories[c.id];
							const count = topicsByCategory(c.id).length;
							return (
								<li key={c.id} className="reveal flex flex-col bg-bg p-7">
									<div className="flex items-baseline justify-between gap-4">
										<h2 className="text-[16px] font-medium text-text-hi">{cat.ad}</h2>
										<span className="tnum shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
											<span className="sr-only">{d.forum.pageTitle}: </span>
											{formatNumber(count, locale)}
										</span>
									</div>
									<p className="mt-2 grow text-[14px] leading-[1.65] text-text-dim">
										{cat.aciklama}
									</p>
									<a
										href={newTopicUrl(c.id)}
										rel="noopener"
										className="link-underline mt-5 inline-flex min-h-11 items-center gap-2 self-start text-[13.5px] text-text-mid transition-colors hover:text-text-hi"
									>
										{cat.ad} — {d.forum.newTopic}
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			</section>

			<section className="section-y">
				<div className="shell">
					<h2 className="text-balance text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-hi">
						{d.forum.allTopics}
					</h2>

					{topics.length === 0 ? (
						<div className="mt-10 rounded-[3px] border border-line bg-bg-1 px-7 py-16 text-center">
							<h3 className="text-[18px] font-medium text-text-hi">{d.forum.emptyTitle}</h3>
							<p className="mx-auto mt-3 max-w-md text-pretty text-[14.5px] leading-[1.68] text-text-mid">
								{d.forum.emptyLead}
							</p>
							<a
								href={newTopicUrl()}
								rel="noopener"
								className="mt-8 inline-flex min-h-11 items-center rounded-[3px] bg-accent px-5 py-3 text-[14.5px] font-medium text-accent-ink transition-opacity hover:opacity-90"
							>
								{d.forum.newTopic}
							</a>
							<p className="mt-7 font-[family-name:var(--font-mono)] text-[11.5px] text-text-dim">
								{d.forum.pendingNote}
							</p>
						</div>
					) : (
						<ul className="mt-10 border-y border-line">
							{topics.map((t) => {
								const cat = d.forum.categories[t.category];
								const answered = t.replies.some((r) => r.isAnswer);
								return (
									<li key={t.slug} className="border-b border-line last:border-b-0">
										<Link
											href={topicPath(locale, t.slug)}
											className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:gap-8"
										>
											<div className="min-w-0 grow">
												<h3 className="text-[16.5px] font-medium leading-[1.4] text-text-hi transition-colors group-hover:text-text">
													{t.title}
												</h3>
												<p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
													<span>{cat.ad}</span>
													{t.author && (
														<>
															<span aria-hidden="true">·</span>
															<span>@{t.author.login}</span>
														</>
													)}
													<span aria-hidden="true">·</span>
													<time className="tnum" dateTime={t.createdAt}>
														{formatDate(t.createdAt, locale)}
													</time>
													{answered && (
														<span className="rounded-[2px] border border-ok/40 px-1.5 py-0.5 text-[11px] text-ok">
															{d.forum.answered}
														</span>
													)}
												</p>
											</div>
											<div className="flex shrink-0 items-center gap-5 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
												<span className="tnum">
													{formatNumber(t.replyCount, locale)} {d.forum.replies}
												</span>
												<span className="tnum">
													{formatNumber(t.upvotes, locale)} {d.forum.upvotes}
												</span>
											</div>
										</Link>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</section>
		</>
	);
}
