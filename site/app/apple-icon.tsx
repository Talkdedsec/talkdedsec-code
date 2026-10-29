import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#0b0b0c",
					color: "#c9cdd4",
					fontSize: 104,
					fontWeight: 700,
					letterSpacing: "-0.06em",
				}}
			>
				T
			</div>
		),
		size,
	);
}
