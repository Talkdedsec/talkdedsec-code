import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
	subsets: ["latin", "latin-ext"],
	variable: "--font-display",
	display: "swap",
	weight: ["400", "500", "600"],
});

export const mono = JetBrains_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-mono",
	display: "swap",
	weight: ["400", "500"],
});
