"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RevealBoot() {
	const pathname = usePathname();

	useEffect(() => {
		if (CSS.supports("animation-timeline: view()")) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const nodes = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)");
		if (!nodes.length) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-in");
						io.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
		);

		nodes.forEach((n) => io.observe(n));
		return () => io.disconnect();
		// istemci gezinmesinde gelen yeni .reveal düğümleri gözlemsiz kalmasın
	}, [pathname]);

	return null;
}
