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

let numbers = new Set();

io.on("connection", function(socket) {
    // console.log(socket);

    numbers.add(socket.id);

    io.emit("updatelist", [...numbers]);
    io.emit("countdown", countdown);

    console.log(numbers);

    console.log(`a user connected ${socket.id}`);
    socket.on("disconnect", function() {
        console.log("user disconnected");
        numbers.delete(socket.id);
        io.emit("updatelist", [...numbers]);
    });

    socket.on("reset", function() {
        console.log("Reset");
    });

    socket.on("start", function() {
        console.log("Start", arguments);
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

    console.log("StartCount");

    // const extractionDuration = 18100;
    const extractionDuration = 3000;

    // io.emit("start");

    T = new TWEEN.Tween({
        pos: 0
    }).to(
        {
            pos: extractionDuration
        },
        extractionDuration
    );

    T.easing(TWEEN.Easing.Exponential.InOut);

    const partecipants = numbers.size;

    T.onUpdate(function(delta) {
        console.log(partecipants);

        const pos = Math.ceil(this.pos);

        console.log(pos);
        console.log(pos % partecipants);

        io.emit("countdown", pos % partecipants);
    });

    T.onComplete(() => {
        console.log("End");
        clearInterval(ST);
        counting = false;
        io.emit("result", {
            winner: shuffle([...numbers])[0]
        });
    });

    T.start();

    // clearTimeout(ST);
    ST = setInterval(animate, 100);
}

function animate() {
    TWEEN.update();
}

function count() {
    countdown--;

    if (countdown < 0) {
        countdown = 5;
        io.emit("result", {
            winner: shuffle([...numbers])[0]
        });
    } else {
        io.emit("countdown", countdown);
        ST = setTimeout(count, 1000);
    }
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
