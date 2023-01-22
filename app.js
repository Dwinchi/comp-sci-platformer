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

let SCREEN_HEIGHT = 144;
let SCREEN_WIDTH = 256;

let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 2000,
    jumpSpd: -3000,
    fallSpd: 4000,
}

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
        isOnWall: false,
        isOnGround: false,
        // timer
        wallJumpDelay: 0,

        // Physics
        grav: Physics.grav,
        accel: Physics.accel,
        deccel: Physics.deccel,
        maxSpd: Physics.maxSpd,
        jumpSpd: Physics.jumpSpd,
        fallSpd: Physics.fallSpd,

        cam: {
            x: 0,
            y: 0
        }
    }

    self.update = function() {
        /* -------------------------------------------------------------------------- */
        /*                               Player movement                              */
        /* -------------------------------------------------------------------------- */
        if (Touching(self, self.x, self.y + 1, 1)) {
            self.isOnGround = 1;
            self.canJump = self.maxJumps;
            self.canDash = 1;
        }
        else {
            self.isOnGround = 0;
            self.canJump = 0; // Just one jump
        }
        self.wallJumpDelay = Math.max(self.wallJumpDelay-1,0);

        // Collision with lava
        if (Touching(self, self.x, self.y, 2) && !self.isDashing) {
            self.x = self.enteredX;
            self.y = self.enteredY;
        }
        if (Touching(self, self.x, self.y, 3)) {
            self.grav = 25;
            self.accel = 100;
            self.deccel = 200;
            self.maxSpd = 1000;
            self.jumpSpd = -750;
            self.fallSpd = 1000;
            self.lastState = 3;
            self.canJump = 1;
        } else {
            self.grav = Physics.grav;
            self.accel = Physics.accel;
            self.deccel = Physics.deccel;
            self.maxSpd = Physics.maxSpd;
            self.jumpSpd = Physics.jumpSpd;
            self.fallSpd = Physics.fallSpd;
            if (self.lastState == 3 && self.BTN[5]) { self.ySpd = self.jumpSpd; }
            self.lastState = 0;
        }

        if (self.canDash && self.BTN[6]>0) {
            self.BTN[6] = -1;
            self.isDashing = 1;
            self.dashTimer = 8;
        }

        if (self.isDashing) {
            self.xSpd = 5000 * self.facing;
            self.ySpd = 0;
            self.maxSpd = 5000;
            self.canDash = 0;
            self.dashTimer = Math.max(self.dashTimer-1,0);
            if (self.dashTimer == 0) {
                self.isDashing = 0;
            }
        }
        
        if (!self.wallJumpDelay) {
            // Accelerate
            if (self.AXIS[1]) { self.xSpd += (self.accel*self.AXIS[1]); }
            
            // Deccelerate
            if (!self.AXIS[1]) {
                if ((self.xSpd > 0 && self.xSpd - (self.deccel * Math.sign(self.xSpd)) < 0) ||
                (self.xSpd < 0 && self.xSpd - (self.deccel * Math.sign(self.xSpd)) > 0)) {
                    self.xSpd = 0;
                }
                self.xSpd -= (self.deccel * Math.sign(self.xSpd));
                if (!self.xSpd) { self.x =  Math.floor(self.x); }
            }
            self.xSpd = Clamp(self.xSpd,-self.maxSpd,self.maxSpd);
        }
        if (Touching(self, self.x + (1 * Math.sign(self.xSpd)), self.y, 1)) { self.isOnWall = 1; }
        else { self.isOnWall = 0; }
        
        // Wall jump
        if (self.isOnWall && !self.isOnGround && self.BTN[5]>0 && self.lastState != 3) {
            self.wallJumpDelay = 1;
            self.isOnWall = 0;
            self.xSpd = -Math.sign(self.xSpd) * self.maxSpd;
            jump();
        }
        // Jump
        if (self.BTN[5]>0 && self.canJump) { jump(); }
        
        if (self.isOnWall) { self.xSpd = 0; }
    
        // Wall slide
        if (self.isOnWall && self.ySpd > 0 && self.lastState != 3) { self.ySpd = self.grav/2; }
        // Normal gravity
        else if (!self.isOnGround) { self.ySpd += self.grav; }
    
        self.ySpd = Clamp(self.ySpd,-self.fallSpd,self.fallSpd);
        
        // Horizontal collision
        if (Touching(self, self.x + (self.xSpd/1000), self.y, 1)) {
            while (!Touching(self, self.x + Math.sign(self.xSpd), self.y, 1)) { self.x += Math.sign(self.xSpd); }
            self.xSpd = 0;
        }
        self.x += (Math.abs(self.xSpd) / 1000) * Math.sign(self.xSpd);
        self.xInt = Math.floor(self.x);
        
        // Vertical collision
        if (Touching(self, self.x, self.y + (self.ySpd/1000), 1)) {
            while (!Touching(self, self.x, self.y + Math.sign(self.ySpd), 1)) { self.y += Math.sign(self.ySpd); }
            self.ySpd = 0;
        }
        //self.y += (self.ySpd / 1000);
        self.y += (Math.abs(self.ySpd) / 1000) * Math.sign(self.ySpd);
        self.yInt = Math.floor(self.y);

        checkScreenChange(self);

        function jump(obj) {
            self.ySpd = self.jumpSpd;
            self.BTN[5] = -1;
            self.canJump = Math.max(self.canJump-1,0);
        }

        function checkScreenChange(obj) {
            let x = [0,0,0,0];
            let y = [0,0,0,0];
        
            let l = Game.world.levels[obj.screen].layerInstances[0].entityInstances;

            for (let i of l) {
                if (i.__identifier == "Change_Area") {
                    x[0] = obj.x;
                    x[1] = obj.x + obj.w;
                    x[2] = i.px[0];
                    x[3] = i.px[0] + i.width;
                    y[0] = obj.y;
                    y[1] = obj.y + obj.h;
                    y[2] = i.px[1];
                    y[3] = i.px[1] + i.height;

                    if (
                        x[0] <= x[3] &&
                        x[1] >= x[2] &&
                        y[0] <= y[3] &&
                        y[1] >= y[2]) {
                        let nextScreen = i.fieldInstances[0].__value;
                        let nextDir = i.fieldInstances[1].__value;
                        obj.screen = nextScreen;
                        if (nextDir == 1) { obj.x = 2; }
                        if (nextDir == 3) { obj.x = 246; }
                        if (nextDir == 0) { obj.y = 134; }
                        if (nextDir == 2) { obj.y = 2; }

                        obj.enteredX = obj.x;
                        obj.enteredY = obj.y;
                    }
                }
            }
        }

        /* -------------------------------------------------------------------------- */
        /*                                  ANIMATION                                 */
        /* -------------------------------------------------------------------------- */

        // Set rotation
        if (self.xSpd > 0) {
            self.sr = 0;
            self.facing = 1;
        }
        else if (self.xSpd < 0) {
            self.sr = 1;
            self.facing = -1;
        }

        // EMOTE
        if (self.isOnGround && !self.xSpd && self.AXIS[0] == 1) {
            self.st++;

            if (self.st == 6) {
                self.st = 0;
                // Continue animation
                if (self.animID == 0) { self.si = 0; self.sr = 0; }
                if (self.animID == 1) { self.si = 6; self.sr = 0; }
                if (self.animID == 2) { self.si = 6; self.sr = 1; }
                if (self.animID == 3) { self.si = 0; self.sr = 1; }
                if (self.animID == 4) { self.si = 6; self.sr = 1; }
                if (self.animID == 5) { self.si = 6; self.sr = 0; }
                self.animID++;
                if (self.animID == 6) { self.animID = 0; }
            }
        }
        // Idle
        else if (self.isOnGround && !self.xSpd) { self.si = 0; }
        // Run
        if (self.xSpd) {
            if (self.si == 0 && self.st == 0) { self.si = 1; }
            self.st++;

            if (self.st == 6) {
                self.st = 0;
                // Continue animation
                self.si++;
                if (self.si >= 5) {
                    self.si = 1;
                }
            }
        }
        if (!self.isOnGround) {
            // Jumping & falling
            if (self.ySpd < 0) { self.si = 3; }
            if (self.ySpd > 0) { self.si = 4; }
        }
        // Wallslide
        if (self.isOnWall && !self.isOnGround && self.lastState != 3) { self.si = 5; }
    
        // UPDATE CAMERA
        //* Camera follows object
        if (Game.world.levels[self.screen].pxWid > SCREEN_WIDTH) {
            self.cam.x = self.x - (SCREEN_WIDTH / 2) - 4;
            self.cam.x = Clamp(self.cam.x, 0, Game.world.levels[self.screen].pxWid - SCREEN_WIDTH);
        } else { self.cam.x = 0; }
        if (Game.world.levels[self.screen].pxHei > SCREEN_HEIGHT) {
            self.cam.y = self.y - (SCREEN_HEIGHT / 2) - 4;
            self.cam.y = Clamp(self.cam.y, 0, Game.world.levels[self.screen].pxHei - SCREEN_HEIGHT);
        } else { self.cam.y = 0; }
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
        world: Game.worldID,
        startScreen: Game.screenID,
        PLAYER_LIST: PLAYER_LIST
    };

    socket.emit('initClient', pack);

    socket.on('disconnect', function() {
        console.log(`Player ${socket.id} has disconnected`);
        newID.push(socket.id);
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('updateKeys', function(data) {
        player.BTN = data.BTN;
        player.AXIS = data.AXIS;
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
        p.update();
        pack.players[player] = p;
    }

    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        socket.emit('updateClient', pack);
    }
},1000/60);

function Clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function Touching(obj, x, y, checkFor) {
    x = Math.floor(x);
    y = Math.floor(y);

    let x1;
    let x2;
    let y1;
    let y2;
    let t0;
    let t1;
    let t2;
    let t3;

    let l = Game.world.levels[obj.screen].layerInstances[1];

    x1 = Math.floor(x / 8);
    x2 = Math.floor((x + obj.w) / 8);
    y1 = Math.floor(y / 8);
    y2 = Math.floor((y + obj.h) / 8);

    t0 = l.intGridCsv[x1 + (y1 * (l.__cWid))];
    t1 = l.intGridCsv[x2 + (y1 * (l.__cWid))];
    t2 = l.intGridCsv[x1 + (y2 * (l.__cWid))];
    t3 = l.intGridCsv[x2 + (y2 * (l.__cWid))];

    if (t1 == checkFor || t0 == checkFor) {
        return checkFor;
    } else if (t2 == checkFor || t3 == checkFor) {
        return checkFor;
    }

    if (t1 == checkFor || t3 == checkFor) {
        return checkFor;
    } else if (t0 == checkFor || t2 == checkFor) {
        return checkFor;
    }
    return 0;
}