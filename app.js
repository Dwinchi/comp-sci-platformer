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

let newID = 0;

let io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket) {
    socket.on('submitPlayer', function(name) {
        socket.playerID = newID;
        newID++;
        socket.name = name;
        console.log(`Player ${socket.name} has connected`);

        SOCKET_LIST[socket.id] = socket;
        PLAYER_LIST[socket.playerID] = null;
        let pack = {
            socketID: socket.id,
            localID: socket.playerID,
            screenID: Game.screenID,
            PLAYER_LIST: PLAYER_LIST
        };
        socket.emit('initClient', pack);
    });

    socket.on('disconnect', function() {
        if (socket.name) {
            console.log(`Player ${socket.name} has disconnected`);
        }
        delete SOCKET_LIST[socket.id];
        /* PLAYER_LIST.splice(PLAYER_LIST.indexOf(PLAYER_LIST.find(({ socketID }) => socketID === socket.id)),1);
        console.log(PLAYER_LIST); */
        delete PLAYER_LIST[socket.playerID];
    });

    socket.on('updateServer', function(data) {
        PLAYER_LIST[socket.playerID] = data;
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