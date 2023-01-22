let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(4000);
console.log("Server started.");

let SOCKET_LIST = [];
let PLAYER_LIST = [];

let Game = {
    screenID: 0,
    worldID: 1,
    world: {},
    currentScreen: {}
}
Game.world = require(`./client/levels/World1.json`);
Game.currentScreen = Game.world.levels[Game.screenID];

let Player = function(id) {
    let self = {
        id: id,
        color: id,
        x: Game.currentScreen.layerInstances[0].entityInstances[0].px[0],
        y: Game.currentScreen.layerInstances[0].entityInstances[0].px[1],
        xInt: Game.currentScreen.layerInstances[0].entityInstances[0].px[0],
        yInt: Game.currentScreen.layerInstances[0].entityInstances[0].px[1],
        enteredX: Game.currentScreen.layerInstances[0].entityInstances[0].px[0],
        enteredY: Game.currentScreen.layerInstances[0].entityInstances[0].px[1],
        w: 7,
        h: 7,
        screen: Game.screenID,
        xSpd: 0,
        ySpd: 0,
        BTN: [0,0,0,0],
        AXIS: [0,0],
        lastState: 0,
        // animation
        facing: 1,
        s: 0,
        si: 0,
        sr: 0,
        st: 0,
        animID: 0,
        // states
        canJump: 0,
        maxJumps: 1,
        canDash: 0,
        dashTimer: 0,
        isDashing: 0,
        isStunned: 1,
        isOnWall: false,
        isOnGround: false,
        // timer
        wallJumpDelay: 0,

        cam: {
            x: 0,
            y: 0
        }
    }

    return self;
}

let newID = [0,1,2,3,4,5,6,7];

let io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket) {
    socket.id = newID[0];
    newID.shift();
    console.log(`Player ${socket.id} has connected`);
    SOCKET_LIST[socket.id] = socket;

    let player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    let pack = {
        localID: socket.id,
        //world: Game.worldID,
        localPlayer: player,
        PLAYER_LIST: PLAYER_LIST
    };

    socket.emit('initClient', pack);

    socket.on('disconnect', function() {
        console.log(`Player ${socket.id} has disconnected`);
        newID.push(socket.id);
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('updateServer', function(data) {
        PLAYER_LIST[socket.id] = data;
    });
});

setInterval(function() {
    let pack = {
        players: []
    };

    for (let player in PLAYER_LIST) {
        let p = undefined;
        if (PLAYER_LIST[player] != null) {
            p = PLAYER_LIST[player];
        }
        pack.players[player] = p;
    }

    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        socket.emit('updateClient', pack);
    }
},1000/60);