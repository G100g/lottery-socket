import React, { Component } from "react";

import io from "socket.io-client";

class Dealer extends Component {
    state = {
        connected: false,
        number: null,
        clients: [],
        countdown: null,
        winner: null,
        clientId: ""
    };
    componentDidMount() {
        const socket = io({
            path: "/lottery",
            query: {
                dealer: true
            }
        });

        socket.on("connect", () => {
            this.setState({ connected: true, clientId: this.socket.id });
        });

        socket.on("reconnect_attempt", () => {
            socket.io.opts.query = {
                dealer: true
            };
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
            <div>
                {!this.state.connected && <div>Connecting...</div>}
                {this.state.connected && (
                    <div>
                        <p>{this.state.clients[this.state.countdown]}</p>

                        <button
                            type="button"
                            onClick={() => this.startCount()}
                            disabled={this.state.counting}
                        >
                            START
                        </button>

                        <p>
                            {Object.keys(this.state.clients).length}{" "}
                            Partecipants
                        </p>

                        <ul>
                            {Object.keys(this.state.clients).map(id => (
                                <li key={id}>{this.state.clients[id]}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default Dealer;
