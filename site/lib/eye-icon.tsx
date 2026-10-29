import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// the classic eye, cropped to its dots (content box 834 px wide inside the 1000 px logo)
export async function eyeIcon(px: number) {
	const logo = await readFile(join(process.cwd(), "assets/logo.png"));
	const k = (px * 0.9) / 834;
	return new ImageResponse(
		(
			<div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b0b0c" }}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`data:image/png;base64,${logo.toString("base64")}`}
					width={1000 * k}
					height={1000 * k}
					style={{ position: "absolute", left: px / 2 - 503 * k, top: px / 2 - 507 * k }}
					alt=""
				/>
			</div>
		),
		{ width: px, height: px },
	);
}
