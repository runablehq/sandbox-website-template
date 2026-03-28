import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import type { Plugin } from "vite";

type WebsiteConfig = {
	id?: string;
	name?: string;
	description?: string;
	url?: string;
	hostname?: string;
	port?: number;
	/** Databuddy project client ID (from app.databuddy.cc). Override with VITE_DATABUDDY_CLIENT_ID. */
	databuddyClientId?: string;
	/** Default: https://cdn.databuddy.cc/databuddy.js */
	databuddyScriptUrl?: string;
	/** Default: https://basket.databuddy.cc */
	databuddyApiUrl?: string;
};

function setDataAttributes(
	el: Element,
	props: Record<string, string | boolean | number | string[] | Record<string, unknown> | undefined>,
) {
	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null) continue;
		const dataKey = `data-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
		if (Array.isArray(value) || (typeof value === "object" && !Array.isArray(value))) {
			el.setAttribute(dataKey, JSON.stringify(value));
		} else {
			el.setAttribute(dataKey, String(value));
		}
	}
}

export default function databuddyAnalyticsPlugin(): Plugin {
	let rootDir = process.cwd();

	return {
		name: "databuddy-analytics-plugin",
		enforce: "pre",
		configResolved(config) {
			rootDir = config.root;
		},
		async transformIndexHtml(html) {
			const raw = await fs.readFile(path.resolve(rootDir, "website.config.json"), "utf-8");
			const config = JSON.parse(raw) as WebsiteConfig;

			const clientId = process.env.VITE_DATABUDDY_CLIENT_ID ?? config.databuddyClientId ?? "";
			if (!clientId) {
				return html;
			}

			const dom = new JSDOM(html);
			const doc = dom.window.document;
			const head = doc.head;

			const script = doc.createElement("script");
			script.src = config.databuddyScriptUrl ?? "https://cdn.databuddy.cc/databuddy.js";
			script.async = true;
			script.crossOrigin = "anonymous";
			script.setAttribute("data-databuddy-injected", "true");

			setDataAttributes(script, {
				clientId,
				apiUrl: config.databuddyApiUrl ?? "https://basket.databuddy.cc",
				trackWebVitals: true,
				trackErrors: true,
				trackPerformance: true,
			});

			head.appendChild(script);
			return dom.serialize();
		},
	};
}
