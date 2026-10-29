import Link from "next/link";

export default function NotFound() {
	return (
		<div className="section-y">
			<div className="shell max-w-xl">
				<p className="eyebrow font-[family-name:var(--font-mono)]">404</p>
				<h1 className="mt-4 text-balance text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text-hi">
					Bu sayfa yok · Page not found
				</h1>
				<p className="mt-5 text-[15.5px] leading-[1.7] text-text-mid">
					Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
					<br />
					The page you were looking for may have moved, or never existed.
				</p>
				<div className="mt-8 flex flex-wrap gap-4">
					<Link
						href="/tr/"
						className="rounded-[3px] bg-accent px-5 py-2.5 text-[14px] font-medium text-accent-ink transition-opacity hover:opacity-90"
					>
						Ana sayfa
					</Link>
					<Link
						href="/en/"
						className="rounded-[3px] border border-line-strong px-5 py-2.5 text-[14px] text-text transition-colors hover:border-chrome hover:text-text-hi"
					>
						Home
					</Link>
				</div>
			</div>
		</div>
	);
}
