// GitHub Pages picks the content type from the file extension, but `next export` writes generated images
// (opengraph-image, icon, apple-icon) without one, and the icon links skip basePath. Both are fixed after the build.
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const site = await readFile(new URL("../lib/site.ts", import.meta.url), "utf8");
const BASE = site.match(/export const BASE = "([^"]+)"/)?.[1];
if (!BASE) throw new Error("BASE not found in lib/site.ts");

const IMAGES = new Set(["opengraph-image", "twitter-image", "icon", "apple-icon"]);
let images = 0, pages = 0;

async function* walk(dir) {
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* walk(p);
		else yield p;
	}
}

for await (const file of walk(OUT)) {
	const name = basename(file);
	if (IMAGES.has(name)) {
		await copyFile(file, `${file}.png`);
		images++;
		continue;
	}
	const ext = extname(file);
	if (ext !== ".html" && ext !== ".txt") continue;
	const before = await readFile(file, "utf8");
	const after = before
		.replace(/\/(opengraph-image|twitter-image)\?/g, "/$1.png?")
		.replace(/"\/(icon|apple-icon)\?/g, `"${BASE}/$1.png?`);
	if (after !== before) {
		await writeFile(file, after);
		pages++;
	}
}

console.log(`pages-uzanti: ${images} images got .png, ${pages} files rewritten`);
