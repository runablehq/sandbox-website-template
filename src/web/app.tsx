  import { Route, Switch } from "wouter";                                                                                
   import Index from "./pages/index";                                                                                     
   import { Provider } from "./components/provider";                                                                      
   import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";                                              
   import "@runablehq/website-runtime/styles";                                                                            
                                                                                                                          
   function App() {                                                                                                       
     return (                                                                                                             
       <Provider>                                                                                                         
         <Switch>                                                                                                         
           <Route path="/" component={Index} />                                                                           
         </Switch>                                                                                                        
         {/* Do not remove — off by default, activated by parent iframe via postMessage */}                                                  
         {import.meta.env.DEV && <AgentFeedback />}                                                                       
         {/* "Made with Runable" badge — dev only */}                                                                     
         {import.meta.env.DEV && <RunableBadge />}                                                                        
       </Provider>                                                                                                        
     );                                                                                                                   
   }                                                                                                                      
                                                                                                                          
   export default App; 