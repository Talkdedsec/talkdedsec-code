import data from "@/data/konular.json";
import { SITE, type Locale } from "./site";

export interface ForumAuthor {
	login: string;
	url: string;
}

export interface ForumReply {
	id: string;
	author: ForumAuthor | null;
	html: string;
	createdAt: string;
	url: string;
	isAnswer: boolean;
}

export interface ForumTopic {
	number: number;
	slug: string;
	title: string;
	html: string;
	author: ForumAuthor | null;
	category: CategoryId;
	createdAt: string;
	updatedAt: string;
	url: string;
	upvotes: number;
	replyCount: number;
	replies: ForumReply[];
}

export interface ForumData {
	/** null: depo henüz yayında değil ya da çekim yapılmadı — sayfa boş durumu gösterir */
	fetchedAt: string | null;
	topics: ForumTopic[];
}

export type CategoryId = "duyurular" | "sorular" | "temalar" | "fikirler" | "genel";

export interface Category {
	id: CategoryId;
	/** GitHub Discussions kategori slug'ı — "konu aç" bağlantısı buna gider */
	github: string;
}

export const CATEGORIES: Category[] = [
	{ id: "duyurular", github: "announcements" },
	{ id: "sorular", github: "q-a" },
	{ id: "temalar", github: "show-and-tell" },
	{ id: "fikirler", github: "ideas" },
	{ id: "genel", github: "general" },
];

export const FORUM: ForumData = data as ForumData;

export function getTopic(slug: string) {
	return FORUM.topics.find((t) => t.slug === slug);
}

/** çekim yanıtları 50'de kesiyor; replyCount tam sayıyı taşır, replies taşımaz */
export function repliesTruncated(topic: ForumTopic) {
	return topic.replyCount > topic.replies.length;
}

export function topicsByCategory(id: CategoryId) {
	return FORUM.topics.filter((t) => t.category === id);
}

export function getCategory(id: CategoryId) {
	return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function newTopicUrl(category?: CategoryId) {
	const github = category ? getCategory(category).github : "general";
	return `${SITE.repo}/discussions/new?category=${github}`;
}

export const DISCUSSIONS_URL = `${SITE.repo}/discussions`;

export function topicPath(locale: Locale, slug: string) {
	return `/${locale}/topluluk/konular/${slug}/`;
}
