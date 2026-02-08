import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import type { Plugin } from "vite";

type WebsiteConfig = {
	name?: string;
	description?: string;
	url?: string;
	hostname?: string;
	ogImage?: string;
	favicon?: string;
	twitter?: {
		card?: string;
		site?: string;
	};
	themeColor?: string;
};

export default function websiteSeoPlugin(): Plugin {
	let rootDir = process.cwd();

	return {
		name: "website-seo-plugin",
		enforce: "pre",
		configResolved(config) {
			rootDir = config.root;
		},
		async transformIndexHtml(html) {
			const raw = await fs.readFile(path.resolve(rootDir, "website.config.json"), "utf-8");
			const config = JSON.parse(raw) as WebsiteConfig;

			const dom = new JSDOM(html);
			const doc = dom.window.document;
			const head = doc.head;

			const name = config.name ?? "";
			const description = config.description ?? "";
			const siteUrl = config.url ?? "";
			const hostname = config.hostname ?? "";
			const ogImage = config.ogImage ?? "";
			const favicon = config.favicon ?? "/favicon.ico";
			const themeColor = config.themeColor ?? "";

			// Title
			if (!head.querySelector("title")) {
				head.appendChild(doc.createElement("title"));
			}
			head.querySelector("title")!.textContent = name;

			// Meta tags
			const metaTags: Array<["name" | "property", string, string]> = [
				["name", "description", description],
				["name", "twitter:card", config.twitter?.card ?? "summary_large_image"],
				["name", "twitter:site", config.twitter?.site ?? ""],
				["name", "twitter:title", name],
				["name", "twitter:description", description],
				["name", "twitter:image", ogImage],
				["name", "theme-color", themeColor],
				["property", "og:title", name],
				["property", "og:description", description],
				["property", "og:image", ogImage],
				["property", "og:url", siteUrl],
				["property", "og:type", "website"],
			];

			for (const [attr, key, content] of metaTags) {
				head.querySelectorAll(`meta[${attr}="${key}"]`).forEach((el) => el.remove());
				const meta = doc.createElement("meta");
				meta.setAttribute(attr, key);
				meta.setAttribute("content", content);
				head.appendChild(meta);
			}

			// Favicon
			head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) =>
				el.remove(),
			);
			const icon = doc.createElement("link");
			icon.rel = "icon";
			icon.href = favicon;
			head.appendChild(icon);

			// Runable script
			const script = doc.createElement("script");
			script.defer = true;
			script.src = "./runable.js";
			script.dataset.debug = "orm.drizzle.team";
			script.dataset.hostname = hostname;
			script.dataset.url = "r.lilstts.com";
			head.appendChild(script);

			return dom.serialize();
		},
	};
}
