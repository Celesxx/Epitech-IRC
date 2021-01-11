import App from "../components/pages/App.jsx";
import { BrowserRouter as Router, Route } from "react-router-dom";


function route()
{
    return(

        <Router>
            <Route path="/" exact component={App}></Route>
        </Router>
    );
}

export default route;