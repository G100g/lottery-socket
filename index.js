// @ts-check

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http, {
    path: "/lottery"
});
const TWEEN = require("tween.js");

app.get("/", function(req, res) {
    res.send("<h1>Hello world</h1>");
});

let connectedClients = {};

io.on("connection", function(socket) {
    if (!socket.handshake.query.dealer) {
        console.log("I'm a player");
        connectedClients[socket.id] = Math.round(Math.random() * 500);
        io.emit("updatelist", connectedClients);
    } else {
        console.log("I'm the dealer");
    }

    io.emit("countdown", countdown);

    socket.on("disconnect", function() {
        delete connectedClients[socket.id];
        io.emit("updatelist", connectedClients);
    });

    socket.on("start", function() {
        io.emit("startCounting");
        startCount();
    });
});

let ST;
let countdown = 5;
let T;
let counting = false;

function startCount() {
    if (counting) return;

    countdown = 5;
    counting = true;

    // const extractionDuration = 18100;
    const extractionDuration = 3000;

    T = new TWEEN.Tween({
        pos: 0
    }).to(
        {
            pos: extractionDuration
        },
        extractionDuration
    );

    T.easing(TWEEN.Easing.Exponential.InOut);

    const partecipants = Object.keys(connectedClients);

    T.onUpdate(function(delta) {
        const pos = Math.ceil(this.pos);

        // console.log(pos);
        // console.log(pos % partecipants);

        io.emit("countdown", partecipants[pos % partecipants.length]);
    });

    T.onComplete(() => {
        clearInterval(ST);
        counting = false;
        io.emit("result", {
            winner: shuffle(Object.keys(connectedClients))[0]
        });
    });

    T.start();

    // clearTimeout(ST);
    ST = setInterval(animate, 100);
}

function animate() {
    TWEEN.update();
}

function shuffle(originalArray) {
    let array = originalArray.slice();
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

http.listen(process.env.PORT || 3001, function() {
    console.log("listening on *:3001");
});
