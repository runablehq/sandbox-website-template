import { Route, Switch } from "wouter";
import { SiteMetadata } from "./components/site-metadata";
import Index from "./pages/index";

function App() {
	return (
		<>
			<SiteMetadata />
			<Switch>
				<Route path="/" component={Index} />
			</Switch>
		</>
	);
}

export default App;
