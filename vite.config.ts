import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"

export default defineConfig({
	plugins: [react(), cloudflare(), tailwind()],
});
