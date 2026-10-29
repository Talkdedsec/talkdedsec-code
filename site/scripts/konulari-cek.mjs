import { readFile, writeFile } from "node:fs/promises";

const KOK = new URL("../", import.meta.url);
const CIKTI = new URL("data/konular.json", KOK);
const UC = "https://api.github.com/graphql";
const SAYFA_SINIRI = 50;

// lib/*.ts tek kaynak; .mjs bir TS modülünü import edemediği için değerler metinden okunuyor.
const siteKaynak = await readFile(new URL("lib/site.ts", KOK), "utf8");
const forumKaynak = await readFile(new URL("lib/forum.ts", KOK), "utf8");

const repoAdresi = siteKaynak.match(/repo:\s*"([^"]+)"/)?.[1] ?? "";
const [, sahip, depo] = repoAdresi.match(/github\.com\/([^/]+)\/([^/\s"]+)/) ?? [];

const KATEGORILER = new Map();
for (const [, id, github] of forumKaynak.matchAll(/id:\s*"([^"]+)",\s*github:\s*"([^"]+)"/g)) {
	KATEGORILER.set(github.toLowerCase(), id);
}
const VARSAYILAN_KATEGORI = "genel";

const BOSLUK = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const HAM_METIN = new Set(["script", "style", "textarea", "title", "xmp", "noscript", "noembed"]);
const ICERIKLE_AT = new Set([
	"script", "style", "iframe", "object", "embed", "form", "link", "noscript", "noembed", "template",
	"svg", "math", "video", "audio", "canvas", "picture", "source", "track", "button", "select",
	"textarea", "title", "frame", "frameset", "base", "meta", "applet", "param", "map", "area",
	"marquee", "portal", "dialog", "slot", "xmp",
]);

// class YOK: sınıf adı sitenin utility'lerine denk gelirse gövde metni sayfa düzenini ele geçirir
const ETIKETLER = new Map([
	["p", []], ["br", []], ["hr", []],
	["h2", ["id"]], ["h3", ["id"]], ["h4", ["id"]], ["h5", ["id"]], ["h6", ["id"]],
	["strong", []], ["b", []], ["em", []], ["i", []], ["del", []], ["s", []], ["ins", []],
	["sup", ["id"]], ["sub", []], ["kbd", []], ["mark", []], ["small", []], ["abbr", ["title"]],
	["a", ["href", "id", "title"]],
	["ul", []], ["ol", ["start", "reversed"]], ["li", ["id"]],
	["dl", []], ["dt", []], ["dd", []],
	["blockquote", []],
	["pre", []], ["code", []], ["samp", []], ["var", []],
	["table", []], ["thead", []], ["tbody", []], ["tfoot", []], ["tr", []],
	["th", ["align", "colspan", "rowspan"]], ["td", ["align", "colspan", "rowspan"]],
	["details", []], ["summary", []],
	["div", []], ["span", []], ["section", ["id"]],
]);

// sayfanın h1'i konu başlığı; gövdedeki h1 ikinci bir h1 olurdu
const ETIKET_ESLEME = new Map([["h1", "h2"]]);

// GitHub kendi id'lerini user-content- ile önekler; öneksiz id sayfadaki id'lerle çakışır
const ID_ONEK = "user-content-";

const ORTULU_KAPANIS = new Map([
	["p", ["p"]],
	["li", ["li"]],
	["dt", ["dt", "dd"]], ["dd", ["dt", "dd"]],
	["tr", ["tr", "td", "th"]], ["td", ["td", "th"]], ["th", ["td", "th"]],
	["thead", ["thead", "tbody", "tfoot", "tr", "td", "th"]],
	["tbody", ["thead", "tbody", "tfoot", "tr", "td", "th"]],
	["tfoot", ["thead", "tbody", "tfoot", "tr", "td", "th"]],
]);

const kacAmpersan = (s) => String(s).replace(/&(?![#a-zA-Z0-9]+;)/g, "&amp;");
const ozKac = (s) => kacAmpersan(s).replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const metinKac = (s) => kacAmpersan(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");

const gorunurSuz = (s, alcak, yuksek) =>
	[...String(s)].filter((c) => { const k = c.codePointAt(0); return k < alcak || k > yuksek; }).join("");

function guvenliHref(deger) {
	const s = gorunurSuz(deger, 0, 32).replace(String.fromCodePoint(127), "").trim();
	if (!s) return null;
	return /^(https?:\/\/|mailto:|#|\/)/i.test(s) ? s : null;
}

function dosyaAdi(src) {
	const s = String(src ?? "").split(/[?#]/)[0];
	const ad = s.slice(s.lastIndexOf("/") + 1).trim();
	return ad.length > 1 && ad.length < 80 ? ad : "";
}

function oznitelikOku(html, p) {
	const oznitelikler = new Map();
	let kendiKapanan = false;
	while (p < html.length) {
		while (p < html.length && /\s/.test(html[p])) p++;
		if (p >= html.length) break;
		if (html[p] === ">") { p++; break; }
		if (html[p] === "/" && html[p + 1] === ">") { kendiKapanan = true; p += 2; break; }
		if (html[p] === "/") { p++; continue; }
		const adBas = p;
		while (p < html.length && !/[\s=/>]/.test(html[p])) p++;
		const ad = html.slice(adBas, p).toLowerCase();
		const oncesi = p;
		while (p < html.length && /\s/.test(html[p])) p++;
		let deger = "";
		if (html[p] === "=") {
			p++;
			while (p < html.length && /\s/.test(html[p])) p++;
			const q = html[p];
			if (q === '"' || q === "'") {
				const kapa = html.indexOf(q, p + 1);
				deger = kapa < 0 ? html.slice(p + 1) : html.slice(p + 1, kapa);
				p = kapa < 0 ? html.length : kapa + 1;
			} else {
				const degerBas = p;
				while (p < html.length && !/[\s>]/.test(html[p])) p++;
				deger = html.slice(degerBas, p);
			}
		} else {
			p = oncesi;
		}
		if (ad) oznitelikler.set(ad, deger);
	}
	return { oznitelikler, son: p, kendiKapanan };
}

function temizle(kaynak, tartismaUrl) {
	if (typeof kaynak !== "string" || !kaynak) return "";
	const alt = kaynak.toLowerCase();
	const cikti = [];
	const yigin = [];
	let i = 0;
	let atla = null;
	let atlaDerinlik = 0;

	const bagAcik = () => yigin.some((e) => e.ad === "a" && e.yazildi);

	const kapat = (idx) => {
		for (let k = yigin.length - 1; k >= idx; k--) {
			const e = yigin[k];
			if (!e.yazildi) continue;
			if (e.ad === "a" && cikti.slice(e.bas).join("").trim() === "") {
				cikti.length = e.bas - 1;
				continue;
			}
			cikti.push(`</${e.ad}>`);
		}
		yigin.length = idx;
	};

	while (i < kaynak.length) {
		const lt = kaynak.indexOf("<", i);
		if (lt < 0) {
			if (!atla) cikti.push(kaynak.slice(i));
			break;
		}
		if (lt > i && !atla) cikti.push(kaynak.slice(i, lt));
		i = lt;

		if (alt.startsWith("<!--", i)) {
			const son = alt.indexOf("-->", i + 4);
			i = son < 0 ? kaynak.length : son + 3;
			continue;
		}
		if (kaynak[i + 1] === "!" || kaynak[i + 1] === "?") {
			const son = kaynak.indexOf(">", i);
			i = son < 0 ? kaynak.length : son + 1;
			continue;
		}

		const esl = /^<(\/?)([a-zA-Z][a-zA-Z0-9:._-]*)/.exec(kaynak.slice(i, i + 64));
		if (!esl) {
			if (!atla) cikti.push("&lt;");
			i += 1;
			continue;
		}
		const kapanis = esl[1] === "/";
		const ham = esl[2].toLowerCase();
		const ad = ETIKET_ESLEME.get(ham) ?? ham;
		const { oznitelikler, son, kendiKapanan } = oznitelikOku(kaynak, i + esl[0].length);
		i = son;
		const kapsayici = !BOSLUK.has(ad) && !kendiKapanan;

		if (atla) {
			if (!kapanis && ad === atla && kapsayici) atlaDerinlik++;
			else if (kapanis && ad === atla && --atlaDerinlik <= 0) atla = null;
			continue;
		}

		if (!kapanis && HAM_METIN.has(ad) && kapsayici) {
			const kapa = alt.indexOf(`</${ad}`, i);
			const g = kapa < 0 ? -1 : alt.indexOf(">", kapa);
			i = g < 0 ? kaynak.length : g + 1;
			continue;
		}

		if (!kapanis && ICERIKLE_AT.has(ad)) {
			if (kapsayici) { atla = ad; atlaDerinlik = 1; }
			continue;
		}

		if (kapanis) {
			if (ICERIKLE_AT.has(ad)) continue;
			const idx = yigin.findLastIndex((e) => e.ad === ad);
			if (idx >= 0) kapat(idx);
			continue;
		}

		if (ad === "img") {
			const metin = (oznitelikler.get("alt") || "").trim() || dosyaAdi(oznitelikler.get("src")) || "GitHub";
			cikti.push(bagAcik()
				? metinKac(metin)
				: `<a href="${ozKac(tartismaUrl)}" rel="nofollow ugc">${metinKac(metin)}</a>`);
			continue;
		}

		if (ad === "input") {
			if ((oznitelikler.get("type") || "").toLowerCase() !== "checkbox") continue;
			cikti.push(`<input type="checkbox" disabled${oznitelikler.has("checked") ? " checked" : ""}>`);
			continue;
		}

		const izin = ETIKETLER.get(ad);
		const href = ad === "a" ? guvenliHref(oznitelikler.get("href")) : null;
		if (!izin || (ad === "a" && (!href || bagAcik()))) {
			if (kapsayici) yigin.push({ ad, yazildi: false, bas: cikti.length });
			continue;
		}

		const ortulu = ORTULU_KAPANIS.get(ad);
		if (ortulu) while (yigin.length && ortulu.includes(yigin[yigin.length - 1].ad)) kapat(yigin.length - 1);

		const parcalar = [];
		for (const oz of izin) {
			if (!oznitelikler.has(oz)) continue;
			const deger = oz === "href" ? href : oznitelikler.get(oz);
			if (oz === "id" && !String(deger).startsWith(ID_ONEK)) continue;
			parcalar.push(`${oz}="${ozKac(deger)}"`);
		}
		if (ad === "a") parcalar.push('rel="nofollow ugc"');

		cikti.push(`<${ad}${parcalar.length ? " " + parcalar.join(" ") : ""}>`);
		if (kapsayici) yigin.push({ ad, yazildi: true, bas: cikti.length });
	}

	kapat(0);
	return cikti.join("").trim();
}

const TR_HARF = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };

function slugla(number, baslik) {
	const govde = gorunurSuz(
		String(baslik ?? "").replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR_HARF[c]).normalize("NFD"),
		0x300,
		0x36f,
	)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
		.replace(/-+$/g, "");
	return govde ? `${number}-${govde}` : String(number);
}

const yazar = (a) => (a?.login ? { login: String(a.login), url: String(a.url || `https://github.com/${a.login}`) } : null);

const SORGU = `query($sahip:String!,$depo:String!,$imlec:String){
	repository(owner:$sahip,name:$depo){
		discussions(first:100,after:$imlec){
			pageInfo{hasNextPage endCursor}
			nodes{
				number title bodyHTML createdAt updatedAt url upvoteCount
				author{login url}
				category{slug name}
				answerChosenAt
				comments(first:50){
					totalCount
					nodes{id bodyHTML createdAt url author{login url} isAnswer}
				}
			}
		}
	}
}`;

class Sessiz extends Error {}

async function sorgula(token, imlec) {
	const yanit = await fetch(UC, {
		method: "POST",
		headers: {
			authorization: `Bearer ${token}`,
			accept: "application/json",
			"content-type": "application/json",
			"user-agent": "code-talkdedsec",
		},
		body: JSON.stringify({ query: SORGU, variables: { sahip, depo, imlec } }),
	});

	if (!yanit.ok) {
		await yanit.text().catch(() => "");
		if (yanit.status === 401 || yanit.status === 403 || yanit.status === 404) throw new Sessiz(`API ${yanit.status}`);
		throw new Error(`API ${yanit.status}`);
	}

	const govde = await yanit.json();
	if (Array.isArray(govde.errors) && govde.errors.length) {
		const tipler = govde.errors.map((e) => e.type || "").join(",");
		const mesaj = govde.errors.map((e) => e.message).join("; ").slice(0, 200);
		if (/NOT_FOUND|FORBIDDEN|UNAUTHORIZED/i.test(tipler)) throw new Sessiz(mesaj);
		throw new Error(mesaj);
	}
	const tartismalar = govde.data?.repository?.discussions;
	if (!tartismalar) throw new Sessiz("depo ya da tartışmalar görünmüyor");
	return tartismalar;
}

function konuYap(d) {
	const url = String(d.url || "");
	const cevapVar = Boolean(d.answerChosenAt);
	const yanitlar = (d.comments?.nodes ?? [])
		.filter(Boolean)
		.map((c) => ({
			id: String(c.id),
			author: yazar(c.author),
			html: temizle(c.bodyHTML, c.url || url),
			createdAt: String(c.createdAt),
			url: String(c.url || url),
			isAnswer: cevapVar && Boolean(c.isAnswer),
		}))
		.sort((a, b) => (a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : a.createdAt < b.createdAt ? -1 : 1));

	return {
		number: d.number,
		slug: slugla(d.number, d.title),
		title: String(d.title ?? "").trim(),
		html: temizle(d.bodyHTML, url),
		author: yazar(d.author),
		category: KATEGORILER.get(String(d.category?.slug ?? "").toLowerCase()) ?? VARSAYILAN_KATEGORI,
		createdAt: String(d.createdAt),
		updatedAt: String(d.updatedAt),
		url,
		upvotes: d.upvoteCount ?? 0,
		replyCount: d.comments?.totalCount ?? yanitlar.length,
		replies: yanitlar,
	};
}

async function dosyayaYaz(veri) {
	await writeFile(CIKTI, JSON.stringify(veri, null, 2) + "\n", "utf8");
}

async function bosBirak(sebep) {
	await dosyayaYaz({ fetchedAt: null, topics: [] });
	console.log(`konular: atlandı (${sebep}) — data/konular.json boş`);
}

// process.exit() bekleyen undici soketiyle yarışıp Windows'ta libuv assert'ine düşüyor; yalnız exitCode kullan.
async function calistir() {
	const token = process.env.GITHUB_TOKEN;
	if (!sahip || !depo) return bosBirak("lib/site.ts içindeki repo adresi okunamadı");
	if (!token) return bosBirak("GITHUB_TOKEN yok");

	const konular = [];
	let imlec = null;
	for (let sayfa = 0; sayfa < SAYFA_SINIRI; sayfa++) {
		const { nodes, pageInfo } = await sorgula(token, imlec);
		for (const d of nodes ?? []) if (d) konular.push(konuYap(d));
		if (!pageInfo?.hasNextPage) break;
		imlec = pageInfo.endCursor;
	}

	konular.sort((a, b) => (a.updatedAt === b.updatedAt ? b.number - a.number : a.updatedAt < b.updatedAt ? 1 : -1));
	await dosyayaYaz({ fetchedAt: new Date().toISOString(), topics: konular });
	console.log(`konular: ${konular.length} konu, ${konular.reduce((t, k) => t + k.replies.length, 0)} yanıt`);
}

try {
	await calistir();
} catch (hata) {
	if (hata instanceof Sessiz) {
		await bosBirak(hata.message);
	} else {
		console.error(`konular: çekilemedi — ${hata.message}; data/konular.json değiştirilmedi`);
		process.exitCode = 1;
	}
}
