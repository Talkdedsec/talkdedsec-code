import "./globals.css";
import { archivo, mono } from "./fonts";
import { BASE } from "@/lib/site";

// out/404.html'i bu üretir; segment not-found'u çalışma zamanı istediği için tetiklenmez, kabuk burada kurulmalı.
export default function NotFound() {
	return (
		<html lang="tr" className={`${archivo.variable} ${mono.variable}`}>
			<head>
				<title>Sayfa bulunamadı · Page not found — Talkdedsec</title>
				<meta name="robots" content="noindex" />
			</head>
			<body className="font-[family-name:var(--font-display)] antialiased">
				<main className="flex min-h-dvh items-center">
					<div className="shell max-w-xl py-20">
						<p className="eyebrow font-[family-name:var(--font-mono)]">404</p>
						<h1 className="mt-4 text-balance text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text-hi">
							Bu sayfa yok
							<span className="block text-text-mid" lang="en">
								Page not found
							</span>
						</h1>
						<p className="mt-5 text-[15.5px] leading-[1.7] text-text-mid">
							Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
						</p>
						<p className="mt-2 text-[15.5px] leading-[1.7] text-text-dim" lang="en">
							The page you were looking for may have moved, or never existed.
						</p>
						<div className="mt-9 flex flex-wrap gap-4">
							<a
								href={`${BASE}/tr/`}
								className="inline-flex h-11 items-center rounded-[3px] bg-accent px-5 text-[14px] font-medium text-accent-ink transition-opacity hover:opacity-90"
							>
								Ana sayfa
							</a>
							<a
								href={`${BASE}/en/`}
								lang="en"
								className="inline-flex h-11 items-center rounded-[3px] border border-line-strong px-5 text-[14px] text-text transition-colors hover:border-chrome hover:text-text-hi"
							>
								Home
							</a>
						</div>
					</div>
				</main>
			</body>
		</html>
	);
}
