import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"
import visualPlugin from "@runablehq/vite-editor-plugin"
import path from "path";

export default defineConfig({
	plugins: [react(), visualPlugin(), cloudflare(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
		},
	},
	server: {
		allowedHosts: true,
	}
});
