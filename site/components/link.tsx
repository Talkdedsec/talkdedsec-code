import NextLink from "next/link";
import type { ComponentProps } from "react";

// prefetch RSC payload (.txt) ister; statik export'ta o dosya üretilmez, her bağlantı 404 döner.
export function Link(props: ComponentProps<typeof NextLink>) {
	return <NextLink prefetch={false} {...props} />;
}
