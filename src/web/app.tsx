import { Route } from "wouter";
import Index from "./pages/index";

function App() {
	return (
		<Route path="/" component={Index} />
	);
}

export default App;
