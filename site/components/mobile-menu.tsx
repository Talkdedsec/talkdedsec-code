"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Link } from "./link";

// <details> kalır: JS gelmeden de açılıp kapanır, ikon değişimi CSS'te.
export function MobileMenu({
	items,
	menuLabel,
	navLabel,
}: {
	items: { href: string; label: string }[];
	menuLabel: string;
	navLabel: string;
}) {
	const box = useRef<HTMLDetailsElement>(null);
	const pathname = usePathname();

	const close = () => {
		if (box.current) box.current.open = false;
	};

	useEffect(close, [pathname]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "Escape" || !box.current?.open) return;
			box.current.open = false;
			box.current.querySelector("summary")?.focus();
		};
		const onDown = (e: PointerEvent) => {
			if (!box.current?.open) return;
			if (!box.current.contains(e.target as Node)) box.current.open = false;
		};
		document.addEventListener("keydown", onKey);
		document.addEventListener("pointerdown", onDown);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("pointerdown", onDown);
		};
	}, []);

	return (
		<details
			ref={box}
			className="relative -mr-2.5 md:hidden [&[open]_svg.icon-close]:block [&[open]_svg.icon-open]:hidden"
		>
			<summary
				className="flex h-11 w-11 cursor-pointer list-none items-center justify-center text-text-mid transition-colors hover:text-text-hi [&::-webkit-details-marker]:hidden"
				aria-label={menuLabel}
			>
				<svg aria-hidden="true" className="icon-open" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
					<path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
				</svg>
				<svg aria-hidden="true" className="icon-close hidden" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
					<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
				</svg>
			</summary>

			<nav
				onClick={close}
				aria-label={navLabel}
				className="absolute right-0 top-[calc(100%+10px)] flex w-52 flex-col overflow-hidden rounded-[3px] border border-line-strong bg-bg-1"
			>
				{items.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="flex min-h-11 items-center border-b border-line px-4 text-[14px] text-text-mid last:border-b-0 hover:bg-bg-2 hover:text-text-hi focus-visible:-outline-offset-2"
					>
						{item.label}
					</Link>
				))}
			</nav>
		</details>
	);
}
