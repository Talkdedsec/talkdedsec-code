import { eyeIcon } from "@/lib/eye-icon";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return eyeIcon(size.width);
}
