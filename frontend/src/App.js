import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import io from "socket.io-client";

class App extends Component {
    state = {
        connected: false,
        number: null,
        clients: [],
        countdown: null,
        winner: null,
        clientId: ""
    };
    componentDidMount() {
        // const socket = io.apply("http://localhost:3000/lottery");

        const socket = io({
            path: "/lottery"
        });

        socket.on("connect", () => {
            this.setState({ connected: true, clientId: this.socket.id });
        });
        socket.on("updatelist", clients => {
            this.setState({ clients });
        });
        socket.on("countdown", countdown => {
            console.log(countdown);
            this.setState({ countdown });
        });
        socket.on("result", ({ winner }) => {
            console.log(winner);
            this.setState({ winner: socket.id === winner, counting: false });
        });

        socket.on("startCounting", () => {
            console.log("start countdown");
            this.setState({ winner: null, counting: true });
        });

        // socket.on("event", this.onSocketData.bind(this));
        socket.on("disconnect", () => {
            this.setState({ connected: false });
        });

        this.socket = socket;
    }

    onSocketData(data) {
        console.log("Socket", data);
    }

    startCount() {
        console.log("Start");
        this.socket.emit("start");
    }

    render() {
        return (
            <div
                className={[
                    "playerContainer",
                    this.state.counting === true &&
                    this.state.clientId ===
                        this.state.clients[this.state.countdown]
                        ? "current"
                        : "",
                    this.state.counting === false && this.state.winner === true
                        ? "winner"
                        : this.state.counting === false &&
                          this.state.winner === false
                            ? "looser"
                            : ""
                ].join(" ")}
            >
                {this.state.connected && (
                    <div>
                        {this.state.number ? (
                            this.state.number
                        ) : (
                            <p>Getting number...</p>
                        )}
                    </div>
                )}
                {this.state.clientId}
                <p>{this.state.countdown}</p>

                <button type="button" onClick={() => this.startCount()}>
                    START
                </button>

                <p>{this.state.clients.length} Partecipants</p>

                <ul>{this.state.clients.map(id => <li key={id}>{id}</li>)}</ul>
            </div>
        );
    }
}

export default App;
