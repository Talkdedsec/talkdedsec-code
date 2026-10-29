import { BASE } from "@/lib/site";

/** Marka işareti: gerçek logo, maske olarak — currentColor ile boyanır. */
export function Mark({ className }: { className?: string }) {
	return (
		<span
			className={className}
			aria-hidden="true"
			style={{
				display: "inline-block",
				backgroundColor: "currentColor",
				maskImage: `url(${BASE}/logo.png)`,
				WebkitMaskImage: `url(${BASE}/logo.png)`,
				maskSize: "contain",
				WebkitMaskSize: "contain",
				maskRepeat: "no-repeat",
				WebkitMaskRepeat: "no-repeat",
				maskPosition: "center",
				WebkitMaskPosition: "center",
			}}
		/>
	);
}
