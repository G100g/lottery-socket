import React, { Component } from "react";
import QRCode from "qrcode.react";
import io from "socket.io-client";

class Dealer extends Component {
  state = {
    connected: false,
    number: null,
    clients: [],
    countdown: null,
    winner: null,
    clientId: "",
    counting: false
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
      this.setState({ winner, counting: false });
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

  getRandomBackgroundColor() {
    return `hsl(${Math.round(Math.random() * 360)}, 60%, 60%)`;
  }

  render() {
    return (
      <div>
        {!this.state.connected && <div>Connecting...</div>}
        {this.state.connected && (
          <div className={`dealer-deck ${
            this.state.winner ? "is-winner" : ""
          }`}>
            <div
              className={`dealer-deck__box`}
              style={
                this.state.counting
                  ? { backgroundColor: this.getRandomBackgroundColor() }
                  : {}
              }
            >
              {this.state.counting || this.state.winner ? (
                <div className="dealer-deck__box__number">
                  {
                    this.state.clients[
                      this.state.winner || this.state.countdown
                    ]
                  }
                </div>
              ) : (
                <QRCode
                  className="qr-code"
                  renderAs="svg"
                  value={window.location.href.replace("/dealer", "")}
                />
              )}
            </div>

            <button
              className="start-btn"
              type="button"
              onClick={() => this.startCount()}
              disabled={this.state.counting}
            >
              START
            </button>

            <p className="deler-deck__text">
              {Object.keys(this.state.clients).length} Partecipants
            </p>

          </div>
        )}
      </div>
    );
  }
}

export default Dealer;
