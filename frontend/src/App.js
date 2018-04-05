import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Main from "./Main";
import Dealer from "./Dealer";

import "./App.css";

class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Route path="/" exact component={Main} />
                    <Route path="/dealer" exact component={Dealer} />
                </div>
            </Router>
        );
    }
}

export default App;
