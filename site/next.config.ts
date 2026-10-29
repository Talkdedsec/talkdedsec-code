import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// tamamen statik, GitHub Pages proje sitesi: talkdedsec.github.io/talkdedsec-code/
	output: "export",
	basePath: "/talkdedsec-code",
	trailingSlash: true,
	images: { unoptimized: true },
};

export default nextConfig;
