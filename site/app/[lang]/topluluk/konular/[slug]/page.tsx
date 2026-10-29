import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/link";
import { FORUM, getTopic, repliesTruncated } from "@/lib/forum";
import { fill, formatDate, formatNumber } from "@/lib/format";
import { getDict, resolveLocale } from "@/lib/i18n";
import { LOCALES, SITE } from "@/lib/site";

// output:export boş listeyi "generateStaticParams eksik" sayıp derlemeyi kırar; konu yokken yer tutucu şart.
export function generateStaticParams() {
	if (FORUM.topics.length === 0) return LOCALES.map((lang) => ({ lang, slug: "yok" }));
	return LOCALES.flatMap((lang) => FORUM.topics.map((t) => ({ lang, slug: t.slug })));
}

const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	"#39": "'",
	nbsp: " ",
};

function excerpt(html: string, limit = 160) {
	const text = html
		.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/&(#?\w+);/g, (m, key: string) => ENTITIES[key.toLowerCase()] ?? " ")
		.replace(/\s+/g, " ")
		.trim();

	if (text.length <= limit) return text;
	const cut = text.slice(0, limit);
	const space = cut.lastIndexOf(" ");
	return `${(space > 60 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const topic = getTopic(slug);
	if (!topic) return {};

	const d = getDict(locale);
	const description = excerpt(topic.html) || d.forum.metaDesc;

	return {
		title: topic.title,
		description,
		alternates: {
			canonical: `/${locale}/topluluk/konular/${slug}/`,
			languages: {
				tr: `/tr/topluluk/konular/${slug}/`,
				en: `/en/topluluk/konular/${slug}/`,
				"x-default": `/tr/topluluk/konular/${slug}/`,
			},
		},
		openGraph: {
			type: "article",
			url: `${SITE.url}/${locale}/topluluk/konular/${slug}/`,
			siteName: SITE.name,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			title: `${topic.title} — ${SITE.name}`,
			description,
			publishedTime: topic.createdAt,
			modifiedTime: topic.updatedAt,
			authors: topic.author ? [topic.author.login] : undefined,
		},
		twitter: { card: "summary_large_image", title: `${topic.title} — ${SITE.name}`, description },
	};
}

export default async function KonuPage({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { lang, slug } = await params;
	const locale = resolveLocale(lang);
	const d = getDict(locale);
	const topic = getTopic(slug);

	if (!topic) notFound();

	const category = d.forum.categories[topic.category];
	const replies = [...topic.replies].sort((a, b) => Number(b.isAnswer) - Number(a.isAnswer));

	return (
		<div className="section-y">
			<div className="shell">
				<Link
					href={`/${locale}/topluluk/konular/`}
					className="link-underline inline-block font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.1em] text-text-dim hover:text-text"
				>
					← {d.forum.backToTopics}
				</Link>

				<article className="mt-8 max-w-3xl">
					<p className="eyebrow font-[family-name:var(--font-mono)]">{category.ad}</p>

					<h1 className="mt-4 text-balance text-[clamp(1.9rem,3.8vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text-hi">
						{topic.title}
					</h1>

					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
						{topic.author && (
							<a
								href={topic.author.url}
								rel="noopener"
								className="link-underline text-text hover:text-text-hi"
							>
								@{topic.author.login}
							</a>
						)}
						<time className="tnum" dateTime={topic.createdAt}>
							{formatDate(topic.createdAt, locale)}
						</time>
						<span>
							{d.forum.lastUpdated}{" "}
							<time className="tnum" dateTime={topic.updatedAt}>
								{formatDate(topic.updatedAt, locale)}
							</time>
						</span>
					</div>

					<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[12px] text-chrome">
						<span className="tnum">
							{formatNumber(topic.replyCount, locale)} {d.forum.replies}
						</span>
						<span className="tnum">
							{formatNumber(topic.upvotes, locale)} {d.forum.upvotes}
						</span>
					</div>

					<div
						className="prose-forum mt-10"
						dangerouslySetInnerHTML={{ __html: topic.html }}
					/>
				</article>

				{replies.length > 0 && (
					<section className="mt-16 max-w-3xl">
						<h2 className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.1em] text-text-dim">
							<span className="tnum">{formatNumber(replies.length, locale)}</span>{" "}
							{d.forum.replies}
						</h2>

						{repliesTruncated(topic) && (
							<p className="mt-3 font-[family-name:var(--font-mono)] text-[12px] leading-[1.6] text-text-dim">
								{fill(d.forum.shownOf, {
									shown: formatNumber(replies.length, locale),
									total: formatNumber(topic.replyCount, locale),
								})}
							</p>
						)}

						<ol className="mt-6 flex flex-col gap-px overflow-hidden rounded-[3px] border border-line bg-line">
							{replies.map((r) => (
								<li
									key={r.id}
									className={
										r.isAnswer
											? "border-l-2 border-l-ok bg-bg-1 p-6 md:p-7"
											: "bg-bg p-6 md:p-7"
									}
								>
									<div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-[family-name:var(--font-mono)] text-[12px] text-text-dim">
										{r.isAnswer && (
											<span className="rounded-[2px] border border-ok/40 px-2 py-0.5 text-[11px] text-ok">
												{d.forum.answer}
											</span>
										)}
										{r.author && (
											<a
												href={r.author.url}
												rel="noopener"
												className="link-underline text-text hover:text-text-hi"
											>
												@{r.author.login}
											</a>
										)}
										<time className="tnum" dateTime={r.createdAt}>
											{formatDate(r.createdAt, locale)}
										</time>
									</div>

									<div
										className="prose-forum mt-4"
										dangerouslySetInnerHTML={{ __html: r.html }}
									/>
								</li>
							))}
						</ol>
					</section>
				)}

				<div className="mt-14 flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-4 rounded-[3px] border border-line bg-bg-1 p-6">
					<a
						href={topic.url}
						rel="noopener"
						className="inline-flex min-h-11 items-center rounded-[3px] bg-accent px-5 py-3 text-[14.5px] font-medium text-accent-ink transition-opacity hover:opacity-90"
					>
						{d.forum.reply}
					</a>
					<Link
						href={`/${locale}/topluluk/konular/`}
						className="link-underline text-[13.5px] text-text-mid hover:text-text-hi"
					>
						{d.forum.allTopics}
					</Link>
				</div>
			</div>
		</div>
	);
}
