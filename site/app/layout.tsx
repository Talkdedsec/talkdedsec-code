import type { ReactNode } from "react";

/**
 * Kök layout yalnızca 404 için var: /[lang]/layout.tsx kendi <html>/<body>'sini
 * kurar, bu yüzden burada sarmalama yapılmaz — çift html üretilmemeli.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
	return children;
}
