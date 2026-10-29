"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { Link } from "./link";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/site";

const HOME_AT = ["", "#olcum", "#temalar", "#ajan", "#gizlilik", "footer", "#indir"];
const HOME_TO = ["", "", "", "", "", "topluluk/konular/", ""];

const AWAY_LINE = {
	tr: {
		olcum: "Bu sayfa rakamların nasıl ölçüldüğünü anlatıyor: hangi makine, hangi sürüm, hangi profil.",
		belgeler: "Belgeler burada, kısa tutuldu. Editörü kurmak için okumak zorunda değilsin.",
		indir: "İndirme sayfasındasın. Tek dosya, yönetici hakkı yok, güncelleme sunucusu yok.",
		topluluk: "Temalar buradan geliyor. Hesap yok, form yok; bir pull request yetiyor.",
		other: "Buradayım. Hangi sayfaya gidersen git seninle geliyorum.",
	},
	en: {
		olcum: "This page shows how the numbers were measured: which machine, which build, which profile.",
		belgeler: "The docs live here, kept short. You don't have to read them to install the editor.",
		indir: "You're on the download page. One file, no admin rights, no update server.",
		topluluk: "This is where themes come from. No account, no form; a pull request is enough.",
		other: "I'm here. Whichever page you open, I come along.",
	},
} as const;

const AWAY_UI = {
	tr: { tour: "Yedi duraklık turun tamamını ana sayfada anlatıyorum.", cta: "Turu ana sayfada başlat" },
	en: { tour: "I tell the whole seven-stop tour on the home page.", cta: "Start the tour on the home page" },
} as const;

const SIDES = ["top", "left", "right", "bottom"] as const;
type Side = (typeof SIDES)[number];

// 80, globals.css'teki html{scroll-padding-top:5rem} ile aynı kalmalı
const HEAD = 80;
const EDGE = 16;
const GAP = 18;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function EyeGuide({
	locale,
	t,
	sceneRef,
}: {
	locale: Locale;
	t: Dict["guide"];
	sceneRef?: RefObject<HTMLDivElement | null>;
}) {
	const pathname = usePathname();
	const section = pathname.split("/").filter(Boolean)[1] ?? "";
	const atHome = section === "";

	const away = AWAY_LINE[locale];
	const ui = AWAY_UI[locale];
	const lines = atHome
		? t.steps
		: [away[section as keyof typeof away] ?? away.other, ui.tour];

	const [live, setLive] = useState(false);
	const [ready, setReady] = useState(false);
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const [typed, setTyped] = useState("");
	const [settled, setSettled] = useState(false);
	const [said, setSaid] = useState("");

	const trigger = useRef<HTMLButtonElement>(null);
	const anchor = useRef<HTMLDivElement>(null);
	const card = useRef<HTMLDivElement>(null);
	const timer = useRef(0);

	const box = useRef<{ x: number; y: number; d: number } | null>(null);
	const fed = useRef(false);
	const hit = useRef({ x: 0, y: 0, r: 0 });
	const near = useRef(false);
	const shownD = useRef(0);
	const size = useRef({ w: 340, h: 220 });
	const side = useRef<Side>("top");
	const frame = useRef(0);
	const known = useRef(false);

	const done = index >= lines.length;
	const line = done ? t.bye : lines[index];
	const href = atHome ? (HOME_TO[index] ? `/${locale}/${HOME_TO[index]}` : "") : index === 1 ? `/${locale}/` : "";
	const cta = atHome ? t.to : ui.cta;

	const place = useCallback(() => {
		const b = box.current;
		if (!b) return;

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const d = clamp(b.d, 88, 200);
		const cx = clamp(b.x, 0, vw);
		const cy = clamp(b.y, 0, vh);
		const half = d / 2;

		hit.current = { x: cx, y: cy, r: half };

		const t = trigger.current;
		if (t) {
			if (Math.abs(b.d - shownD.current) > 1) {
				shownD.current = b.d;
				t.style.width = `${d}px`;
				t.style.height = `${d}px`;
				// halka tıklama alanına değil gözün gerçek çapına oturur; yoksa dev gözün ortasında nişangâh gibi durur
				t.style.setProperty("--tlk-ring", `${Math.round(b.d)}px`);
			}
			t.style.translate = `${Math.round(cx - half)}px ${Math.round(cy - half)}px`;
		}

		const a = anchor.current;
		if (!a) return;

		const { w, h } = size.current;
		const fits: Record<Side, boolean> = {
			top: cy - half - GAP - h >= HEAD,
			left: cx - half - GAP - w >= EDGE,
			right: cx + half + GAP + w <= vw - EDGE,
			bottom: cy + half + GAP + h <= vh - EDGE,
		};

		let s: Side | "none" = side.current;
		if (!fits[side.current]) s = SIDES.find((k) => fits[k]) ?? "none";
		if (s !== "none") side.current = s;

		let bx: number;
		let by: number;
		let ao: number;

		if (s === "top" || s === "bottom") {
			bx = clamp(cx - w / 2, EDGE, Math.max(EDGE, vw - w - EDGE));
			by = s === "top" ? cy - half - GAP - h : cy + half + GAP;
			ao = clamp(cx - bx, 22, Math.max(22, w - 22));
		} else if (s === "left" || s === "right") {
			by = clamp(cy - h / 2, HEAD, Math.max(HEAD, vh - h - EDGE));
			bx = s === "left" ? cx - half - GAP - w : cx + half + GAP;
			ao = clamp(cy - by, 22, Math.max(22, h - 22));
		} else {
			bx = Math.max(EDGE, vw - w - 24);
			by = Math.max(HEAD, vh - h - 24);
			ao = 0;
		}

		a.style.translate = `${Math.round(bx)}px ${Math.round(by)}px`;
		a.style.setProperty("--tlk-ao", `${Math.round(ao)}px`);
		if (a.dataset.tlkSide !== s) a.dataset.tlkSide = s;
	}, []);

	const measure = useCallback(() => {
		const el = card.current;
		if (el) size.current = { w: el.offsetWidth, h: el.offsetHeight };
	}, []);

	const schedule = useCallback(() => {
		if (frame.current) return;
		frame.current = requestAnimationFrame(() => {
			frame.current = 0;
			if (!fed.current) {
				const el = sceneRef?.current;
				if (el) {
					const r = el.getBoundingClientRect();
					if (r.width > 1 && r.height > 1) {
						box.current = {
							x: r.left + r.width / 2,
							y: r.top + r.height / 2,
							d: clamp(Math.min(r.width, r.height) * 0.42, 88, 200),
						};
						if (!known.current) {
							known.current = true;
							setReady(true);
						}
					}
				}
			}
			place();
		});
	}, [place, sceneRef]);

	useEffect(() => {
		const wide = window.matchMedia("(min-width: 1024px)");
		const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setLive(wide.matches && !calm.matches);
		sync();
		wide.addEventListener("change", sync);
		calm.addEventListener("change", sync);
		return () => {
			wide.removeEventListener("change", sync);
			calm.removeEventListener("change", sync);
		};
	}, []);

	useEffect(() => {
		if (!live) return;

		const onBox = (e: Event) => {
			const d = (e as CustomEvent<{ x: number; y: number; d: number }>).detail;
			if (!d || !Number.isFinite(d.x) || !Number.isFinite(d.y) || !(d.d > 0)) return;
			fed.current = true;
			box.current = { x: d.x, y: d.y, d: d.d };
			if (!known.current) {
				known.current = true;
				setReady(true);
			}
			schedule();
		};

		const onMove = (e: PointerEvent) => {
			const t = trigger.current;
			if (!t) return;
			const { x, y, r } = hit.current;
			const on = Math.hypot(e.clientX - x, e.clientY - y) <= r;
			if (on === near.current) return;
			near.current = on;
			t.dataset.near = on ? "1" : "0";
		};

		window.addEventListener("tlk-eye-box", onBox);
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerdown", onMove, { passive: true });
		schedule();

		const el = sceneRef?.current;
		const ro = el ? new ResizeObserver(schedule) : null;
		if (el && ro) ro.observe(el);

		return () => {
			window.removeEventListener("tlk-eye-box", onBox);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerdown", onMove);
			ro?.disconnect();
			if (frame.current) cancelAnimationFrame(frame.current);
			frame.current = 0;
		};
	}, [live, schedule, sceneRef]);

	useLayoutEffect(() => {
		if (!ready) return;
		measure();
		place();
	}, [ready, open, index, measure, place]);

	useEffect(() => {
		const el = card.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			measure();
			schedule();
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [open, measure, schedule]);

	useEffect(() => {
		setIndex(0);
		setSaid("");
	}, [pathname]);

	useEffect(() => {
		if (!open) return;

		setTyped("");
		setSettled(false);
		const chunk = line.length > 90 ? 2 : 1;
		let i = 0;

		timer.current = window.setInterval(() => {
			i = Math.min(line.length, i + chunk);
			setTyped(line.slice(0, i));
			if (i === line.length) {
				window.clearInterval(timer.current);
				setSettled(true);
				setSaid(line);
			}
		}, 20);

		return () => window.clearInterval(timer.current);
	}, [open, line]);

	useEffect(() => {
		if (!open) return;

		const at = atHome ? HOME_AT[index] : index === 0 ? "main h1" : "";
		const el = at ? document.querySelector<HTMLElement>(at) : null;
		if (el && atHome) el.scrollIntoView({ behavior: "smooth", block: "start" });

		const w = window.innerWidth;
		const h = window.innerHeight;
		const r = el?.getBoundingClientRect();
		const cx = r ? r.left + r.width / 2 : w - 210;
		const cy = r ? HEAD + Math.min(r.height, h - HEAD) / 2 : h - 110;
		const grip = (v: number) => clamp(v, -1.15, 1.15);

		window.dispatchEvent(
			new CustomEvent("tlk-gaze", {
				detail: {
					x: grip((cx / w) * 2 - 1),
					y: grip(1 - (cy / h) * 2),
					px: cx,
					py: cy,
					hold: 4.2,
					blink: true,
				},
			}),
		);
	}, [open, index, atHome]);

	useEffect(() => {
		if (open) card.current?.focus({ preventScroll: true });
	}, [open]);

	const close = useCallback(() => {
		window.clearInterval(timer.current);
		setOpen(false);
		trigger.current?.focus();
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, close]);

	const start = () => {
		setIndex(0);
		setSaid("");
		setOpen(true);
	};

	const advance = () => {
		if (!settled) {
			window.clearInterval(timer.current);
			setTyped(line);
			setSettled(true);
			setSaid(line);
			return;
		}
		setIndex((i) => i + 1);
	};

	if (!live || !ready) return null;

	const shown = Math.min(index + 1, lines.length);

	return (
		<>
			<button
				ref={trigger}
				type="button"
				onClick={open ? close : start}
				aria-label={t.open}
				aria-expanded={open}
				aria-controls="tlk-guide-panel"
				className="tlk-eye hidden rounded-full lg:block"
			>
				<span className="tlk-halo pointer-events-none rounded-full border border-[var(--hue)] opacity-0" aria-hidden="true" />
				<span
					className="tlk-eye-ring pointer-events-none rounded-full border border-dashed border-[var(--hue)]"
					aria-hidden="true"
				/>
			</button>

			{open && (
				<div ref={anchor} className="tlk-anchor hidden w-[min(360px,calc(100vw-3rem))] lg:block" data-tlk-side="top">
					<div
						ref={card}
						id="tlk-guide-panel"
						tabIndex={-1}
						role="group"
						aria-label={t.label}
						className="tlk-guide relative w-full rounded-[3px] border border-line bg-bg-1/95 p-5 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-md"
					>
						<span className="tlk-arrow" aria-hidden="true" />

						<div className="flex items-center justify-between gap-4">
							<span className="eyebrow font-[family-name:var(--font-mono)]">{t.label}</span>
							<span className="tnum font-[family-name:var(--font-mono)] text-[11px] text-text-dim">
								{shown}/{lines.length}
							</span>
						</div>

						<span className="mt-3 block h-px w-full bg-line" aria-hidden="true">
							<span
								className="block h-px bg-[var(--hue)] transition-[width] duration-500 ease-[var(--ease)]"
								style={{ width: `${(shown / lines.length) * 100}%` }}
							/>
						</span>

						<p className="relative mt-4 text-[14.5px] leading-[1.65] text-text">
							<span className="invisible" aria-hidden="true">
								{line}
							</span>
							<span className="absolute inset-0" aria-hidden="true">
								<span className={settled ? undefined : "tlk-caret border-r-2"}>{typed}</span>
							</span>
						</p>

						<p className="sr-only" aria-live="polite">
							{said}
						</p>

						{href && (
							<Link href={href} className="link-underline mt-2 inline-block py-3 text-[13.5px] text-text-hi">
								{cta}
							</Link>
						)}

						<div className="mt-3 flex items-center justify-between gap-3">
							<button
								type="button"
								onClick={close}
								className="-ml-3 inline-flex min-h-11 cursor-pointer items-center rounded-[3px] px-3 text-[13px] text-text-mid transition-colors hover:text-text-hi"
							>
								{t.close}
							</button>
							{!done && (
								<button
									type="button"
									onClick={advance}
									className="inline-flex min-h-11 cursor-pointer items-center rounded-[3px] bg-accent px-5 text-[13.5px] font-medium text-accent-ink transition-opacity hover:opacity-90"
								>
									{index === lines.length - 1 ? t.finish : t.next}
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
