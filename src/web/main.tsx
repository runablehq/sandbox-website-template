import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import "./styles.css";
import App from "./app.tsx";

console.log("ENV MODE:", import.meta.env.MODE);
console.log("VITE_BETTER_AUTH_URL:", import.meta.env.VITE_BETTER_AUTH_URL);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Router>
			<App />
		</Router>
	</StrictMode>,
);
