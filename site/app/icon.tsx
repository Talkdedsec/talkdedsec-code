import { eyeIcon } from "@/lib/eye-icon";

export const dynamic = "force-static";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
	return eyeIcon(size.width);
}
