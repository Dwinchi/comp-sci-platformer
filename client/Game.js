//import { Player } from "./Player.js";
import { Lerp, Clamp } from './Util.js';

console.clear();

let socket = io();

let SCREEN_HEIGHT = 144;
let SCREEN_WIDTH = 256;

let ctxUI = document.getElementById("ui-layer").getContext("2d");
let ctxEntity = document.getElementById("entity-layer").getContext("2d");
let ctxScreen = document.getElementById("screen-layer").getContext("2d");

ctxEntity.imageSmoothingEnabled = false;
ctxScreen.imageSmoothingEnabled = false;
ctxUI.imageSmoothingEnabled = false;

let TIMER;
var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

export let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 2000,
    jumpSpd: -3500,
}

export let keys = [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "enter",
    "z",
    "x",
    "c",
]

export let BTN = [0,0,0,0,0,0,0,0];
export let AXIS = [0,0];
let localID = null;

socket.on('initClient', function(data) {
    localID = data.localID;
});

socket.on('updateClient', function(data) {
    tick();
    // Pretty much just a new draw function
    ctxEntity.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxScreen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxUI.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    let players = data.players;
    console.log(players);
    let cam = players[localID].cam;
    cam.img = document.getElementById(`Screen_${players[localID].screen}`);
    ctxScreen.drawImage(cam.img,cam.x,cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);

    // Update players
    for (let i = 0; i < players.length; i++) {
        let p = players[i];
        if (p != undefined && p.screen == players[localID].screen) {
            let img = document.getElementById(`p${i}`);
            ctxEntity.drawImage(img,8 * p.si,8 * p.sr,8,8,p.xInt - cam.x, p.yInt - cam.y,8,8);
        }
    }
});

function startTimer() {
    resize();
    load(GC.state);
    TIMER = setInterval(update, (1000/60));
}

function draw() {
    ctxEntity.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxScreen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxUI.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (GC.level != null && GC.cam != null) { ctxScreen.drawImage(GC.cam.img,GC.cam.x,GC.cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT); }

    for (const i of GC.obj.me) { i.draw(ctxEntity); }
    for (const i of GC.obj.pl) { i.draw(ctxEntity); }
    for (const i of GC.obj.en) { i.draw(ctxEntity); }
    for (const i of GC.obj.se) { i.draw(ctxEntity); }
}

function changeKey(key, state) {
    let k = key.toLowerCase();

    for (let i = 0; i < keys.length; i++) {
        if (k == keys[i] &&
            (BTN[i] == 0 ||
            BTN[i] == 1 ||
            (BTN[i] == -1 && state == 0))) {
            BTN[i] = state;
        }
    }
    
    // Set axis
    if (BTN[0]>0 && !BTN[1]) {
        AXIS[0] = -1;
    } else if (!BTN[0] && BTN[1]>0) {
        AXIS[0] = 1;
    } else if ((!BTN[0] && !BTN[1]) || (BTN[0]>0 && BTN[1]>0)) {
        AXIS[0] = 0;
    }
    
    if (BTN[2]>0 && !BTN[3]) {
        AXIS[1] = -1;
    } else if (!BTN[2] && BTN[3]>0) {
        AXIS[1] = 1;
    } else if ((!BTN[2] && !BTN[3]) || (BTN[2]>0 && BTN[3]>0)) {
        AXIS[1] = 0;
    }

    socket.emit('updateKeys', {
        BTN: BTN,
        AXIS: AXIS
    });
}

document.addEventListener("keydown", function(e) { changeKey(e.key, 1) });
document.addEventListener("keyup", function(e) { changeKey(e.key, 0) });
window.addEventListener("resize", resize);

function resize() {
    let winW = window.innerHeight / SCREEN_HEIGHT;
    let winH = window.innerWidth / SCREEN_WIDTH;
    let SCALE = Math.min(winW,winH);
    
    const layer = document.querySelectorAll('.game-layers');
    
    layer.forEach(l => {
        l.style.width = `${SCALE * SCREEN_WIDTH}px`;
        l.style.height = `${SCALE * SCREEN_HEIGHT}px`;
    });
}

export class Camera {
    constructor(obj) {
        this.img = document.getElementById(GC.level.identifier);
        this.x = obj.x;
        this.y = obj.y;
        this.obj = obj;
        
        GC.obj.en.push(this);
    }

    update() {
        //* Camera follows object
        if (GC.level.width > SCREEN_WIDTH) {
            this.fxPos = this.obj.x - (SCREEN_WIDTH / 2) - 4;
            this.x = Lerp(this.x, this.fxPos, 0.1);
            this.x = Clamp(this.x, 0, GC.level.width - SCREEN_WIDTH);
        }
        if (GC.level.height > SCREEN_HEIGHT) {
            this.fyPos = this.obj.y - (SCREEN_HEIGHT / 2) - 4;
            this.y = Lerp(this.y, this.fyPos, 0.1);
            this.y = Clamp(this.y, 0, GC.level.height - SCREEN_HEIGHT);
        }
    }
}

function tick() {
    var time = Date.now();
    frame++;
    if (time - startTime > 1000) {
        fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
        startTime = time;
        frame = 0;
    }
}

window.onload = resize();

let Player = function(id) {
    let self = {
        id: id,
        x: Game.currentLevel.layerInstances[0].entityInstances[0].px[0],
        y: Game.currentLevel.layerInstances[0].entityInstances[0].px[1],
        w: 8,
        h: 8,
        screen: Game.screenID,
        xSpd: 0,
        ySpd: 0,
        BTN: [0,0,0,0],
        AXIS: [0,0],
        // animation
        s: 0,
        si: 0,
        sr: 0,
        st: 0,
        // states
        canJump: false,
        isOnWall: false,
        isOnGround: false,
        // timer
        wallJumpDelay: 0,

        cam: {
            x: 0,
            y: 0
        }
    }

    self.update = function() {
        /* -------------------------------------------------------------------------- */
        /*                               Player movement                              */
        /* -------------------------------------------------------------------------- */
        self.isOnGround = Touching(self, self.x, self.y + 1);
        self.wallJumpDelay = Math.max(self.wallJumpDelay-1,0);
        
        if (!self.wallJumpDelay) {
            // Accelerate
            if (self.AXIS[1]) { self.xSpd += (Physics.accel*self.AXIS[1]); }
            
            // Deccelerate
            if (!self.AXIS[1]) {
                if ((self.xSpd > 0 && self.xSpd - (Physics.deccel * Math.sign(self.xSpd)) < 0) ||
                (self.xSpd < 0 && self.xSpd - (Physics.deccel * Math.sign(self.xSpd)) > 0)) {
                    self.xSpd = 0;
                }
                self.xSpd -= (Physics.deccel * Math.sign(self.xSpd));
                if (!self.xSpd) { self.x =  Math.floor(self.x); }
            }
            self.xSpd = Clamp(self.xSpd,-Physics.maxSpd,Physics.maxSpd);
        }
    
        self.isOnWall = Touching(self, self.x + (1 * Math.sign(self.xSpd)), self.y);
        
        // Wall jump
        if (self.isOnWall && !self.isOnGround && self.BTN[5]>0) {
            self.wallJumpDelay = 3;
            self.isOnWall = 0;
            self.xSpd = -Math.sign(self.xSpd) * Physics.maxSpd;
            self.ySpd = Physics.jumpSpd;
            self.BTN[5] = -1;
        }
        // Jump
        if (self.BTN[5]>0 && self.isOnGround) {
            self.ySpd = Physics.jumpSpd;
            self.BTN[5] = -1;
        }
        
        if (self.isOnWall) { self.xSpd = 0; }
    
        // Wall slide
        if (self.isOnWall && self.ySpd > 0) { self.ySpd = Physics.grav/2; }
        // Normal gravity
        else { self.ySpd += Physics.grav; }
    
        self.ySpd = Clamp(self.ySpd,-4000,4000);
        
        // Horizontal collision
        if (Touching(self, self.x + (self.xSpd/1000), self.y)) {
            while (!Touching(self, self.x + Math.sign(self.xSpd), self.y)) { self.x += Math.sign(self.xSpd); }
            self.xSpd = 0;
        }
        self.x += Math.floor(Math.abs(self.xSpd) / 1000) * Math.sign(self.xSpd);
        
        // Vertical collision
        if (Touching(self, self.x, self.y + (self.ySpd/1000))) {
            while (!Touching(self, self.x, self.y + Math.sign(self.ySpd))) { self.y += Math.sign(self.ySpd); }
            self.ySpd = 0;
        }
        self.y += (self.ySpd / 1000);

        checkScreenChange(self);

        function checkScreenChange(obj) {
            let x = [0,0,0,0];
            let y = [0,0,0,0];
        
            let l = Game.currentLevel.layerInstances[0].entityInstances;

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
                        console.log("Collision detected!");
                        let next = i.fieldInstances[0].__value;
                        let nextUID = Game.currentLevel.__neighbours.find(({ dir }) => dir === next).levelIid;
                        let nextScreen = Game.world.levels.find(({ iid }) => iid === nextUID).identifier.split("_").pop();
                        obj.screen = nextScreen;
                        
                    }
                }
            }
        }

        /* -------------------------------------------------------------------------- */
        /*                                  ANIMATION                                 */
        /* -------------------------------------------------------------------------- */

        // Set rotation
        if (self.xSpd > 0) { self.sr = 0; }
        else if (self.xSpd < 0) { self.sr = 1; }

        // Idle
        if (self.isOnGround && !self.xSpd) { self.si = 0; }
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

        if (self.isOnWall && !self.isOnGround) { self.si = 5; }
    
        // UPDATE CAMERA
        //* Camera follows object
        if (Game.currentLevel.pxWid > SCREEN_WIDTH) {
            self.cam.x = self.x - (SCREEN_WIDTH / 2) - 4;
            self.cam.x = Clamp(self.cam.x, 0, Game.currentLevel.pxWid - SCREEN_WIDTH);
        }
        if (Game.currentLevel.pxHei > SCREEN_HEIGHT) {
            self.cam.y = self.y - (SCREEN_HEIGHT / 2) - 4;
            self.cam.y = Clamp(self.cam.y, 0, Game.currentLevel.pxHei - SCREEN_HEIGHT);
        }
    }
    return self;
}

