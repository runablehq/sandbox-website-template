import { Route, Switch } from "wouter";
import Index from "./pages/index";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import { Provider } from "./components/provider";

function App() {
	return (
		<Provider>
			<Switch>
				<Route path="/" component={Index} />
				<Route path="/sign-in" component={SignIn} />
				<Route path="/sign-up" component={SignUp} />
			</Switch>
		</Provider>
	);
}

export default App;
