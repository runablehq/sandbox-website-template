import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"
import visualPlugin from "@runablehq/vite-editor-plugin"

export default defineConfig({
	plugins: [react(), visualPlugin(), cloudflare(), tailwind()],
});
