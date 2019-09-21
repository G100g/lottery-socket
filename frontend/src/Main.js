import React, { Component } from "react";

import io from "socket.io-client";

class Main extends Component {
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
      this.setState({ countdown });
    });
    socket.on("result", ({ winner }) => {
      this.setState({ winner: socket.id === winner, counting: false });
    });

    socket.on("startCounting", () => {
      this.setState({ winner: null, counting: true });
    });

    socket.on("disconnect", () => {
      this.setState({ connected: false });
    });

    this.socket = socket;
  }

  render() {
    const playerClass = [
      this.state.counting === true &&
      this.state.clientId === this.state.countdown
        ? "player-deck--current"
        : "",
      this.state.counting === false && this.state.winner === true
        ? "player-deck--winner"
        : this.state.counting === false && this.state.winner === false
        ? "player-deck--looser"
        : ""
    ].join(" ");

    return (
      <div>
        {!this.state.connected && <div>Connecting...</div>}
        {this.state.connected && (
          <div className={`player-deck ${playerClass}`}>
            <div className="player-deck__box">
              <div className="player-deck__box__number">
                {this.state.clients ? (
                  this.state.clients[this.state.clientId]
                ) : (
                  <p>Getting number...</p>
                )}
              </div>
            </div>

            <p className="player-deck__text">
              {Object.keys(this.state.clients).length} Partecipants
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default Main;
