"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/site";

const EyeScene = dynamic(() => import("./hero-scene"), { ssr: false });
const EyeGuide = dynamic(() => import("./eye-guide"), { ssr: false });

export type EyeStage = {
	has: boolean;
	x: number;
	top: number;
	h: number;
	span: number;
};

const BOX_W = 920;
const BOX_H = 820;

export function EyeLayer({ locale, guide }: { locale: Locale; guide: Dict["guide"] }) {
	const [mounted, setMounted] = useState(false);
	const [run, setRun] = useState(false);
	const box = useRef<HTMLDivElement>(null);
	const stage = useRef<EyeStage>({ has: false, x: 0, top: 0, h: 0, span: 1 });
	const pathname = usePathname();

	useEffect(() => {
		const wide = window.matchMedia("(min-width: 1024px)");
		const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
		const hasIdle = typeof window.requestIdleCallback === "function";
		let handle = 0;
		let queued = false;

		const sync = () => {
			const pass = wide.matches && !calm.matches;
			setRun(pass);
			if (!pass || queued) return;
			queued = true;
			// sahne 879 KB three+r3f getiriyor; ilk boyamayı bekletmemesi için boşta zamana bırakılır
			handle = hasIdle
				? window.requestIdleCallback(() => setMounted(true), { timeout: 2200 })
				: window.setTimeout(() => setMounted(true), 900);
		};

		sync();
		wide.addEventListener("change", sync);
		calm.addEventListener("change", sync);

		return () => {
			wide.removeEventListener("change", sync);
			calm.removeEventListener("change", sync);
			if (!queued) return;
			if (hasIdle) window.cancelIdleCallback(handle);
			else window.clearTimeout(handle);
		};
	}, []);

	useEffect(() => {
		const measure = () => {
			const s = stage.current;
			const slot = document.querySelector<HTMLElement>("[data-eye-slot]");
			if (!slot) {
				s.has = false;
				return;
			}
			const r = slot.getBoundingClientRect();
			if (r.height < 1 || r.width < 1) {
				s.has = false;
				return;
			}
			s.has = true;
			s.x = r.left + r.width / 2;
			s.top = r.top + window.scrollY;
			s.h = r.height;
			s.span = Math.max(320, s.top + s.h * 0.62);
		};

		measure();
		const late = window.setTimeout(measure, 500);
		const ro = new ResizeObserver(measure);
		ro.observe(document.documentElement);
		window.addEventListener("resize", measure, { passive: true });

		return () => {
			window.clearTimeout(late);
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, [pathname]);

	return (
		<>
			<div
				className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block"
				style={{ visibility: run ? undefined : "hidden" }}
				aria-hidden="true"
			>
				<div
					ref={box}
					className="absolute left-0 top-0 will-change-transform"
					style={{ width: BOX_W, height: BOX_H, transform: "translate3d(-9999px,-9999px,0)" }}
				>
					{mounted && <EyeScene box={box} stage={stage} paused={!run} />}
				</div>
			</div>
			{mounted && <EyeGuide locale={locale} t={guide} />}
		</>
	);
}
