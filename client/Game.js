import { Lerp, Clamp } from './Util.js';
import * as initWORLD from "./levels/World1.json" assert { type: "json" };

console.clear();

let WORLD = initWORLD.default;

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

let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 2000,
    jumpSpd: -3000,
    fallSpd: 4000,
}

let keys = [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "enter",
    "z",
    "x",
    "c",
]

let BTN = [0,0,0,0,0,0,0,0];
let AXIS = [0,0];
let localID = null;
let localPlayer = null;
let PLAYER_LIST = [];
let connected = 0;

function startTimer() {
    resize();
    TIMER = setInterval(update, (1000/60));
}

socket.on('initClient', function(data) {
    localID = data.localID;
    PLAYER_LIST = data.PLAYER_LIST;
    connected = 1;
    localPlayer = data.localPlayer;
});

socket.on('updateClient', function(data) {
    // Update players
    for (let i = 0; i < data.players.length; i++) {
        if (i != localID) {
            PLAYER_LIST[i] = data.players[i]
        }
    }
});

function update() {
    tick();
    if (connected == 1) {
        playerUpdate(localPlayer);

        let pack = {
            id: localPlayer.id,
            color: localPlayer.color,
            xInt: localPlayer.xInt,
            yInt: localPlayer.yInt,
            w: 7,
            h: 7,
            screen: localPlayer.screen,
            // animation
            facing: localPlayer.facing,
            s: localPlayer.s,
            si: localPlayer.si,
            sr: localPlayer.sr,
        }
        PLAYER_LIST[localID] = pack;
        socket.emit('updateServer', pack);

        draw();
    }
}

function draw() {
    // Pretty much just a new draw function
    ctxEntity.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxScreen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxUI.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let cam = localPlayer.cam;
    cam.img = document.getElementById(`Screen_${localPlayer.screen}`);
    ctxScreen.drawImage(cam.img,cam.x,cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
    
    // Draw players
    for (let i = 0; i < PLAYER_LIST.length; i++) {
        let p = PLAYER_LIST[i];
        if (p != null && p.screen == PLAYER_LIST[localID].screen) {
            let img = document.getElementById(`p${p.color}`);
            ctxEntity.drawImage(img,8 * p.si,8 * p.sr,8,8,p.xInt - cam.x, p.yInt - cam.y,8,8);
        }
    }
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

function tick() {
    var time = Date.now();
    frame++;
    if (time - startTime > 1000) {
        fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
        startTime = time;
        frame = 0;
    }
}

window.onload = startTimer();

function playerUpdate(p) {
    /* -------------------------------------------------------------------------- */
    /*                               Player movement                              */
    /* -------------------------------------------------------------------------- */
    if (Touching(p, p.x, p.y + 1, 1)) {
        p.isOnGround = 1;
        p.canJump = p.maxJumps;
        p.canDash = 1;
    }
    else {
        p.isOnGround = 0;
        p.canJump = 0; // Just one jump
    }
    p.wallJumpDelay = Math.max(p.wallJumpDelay-1,0);

    // Collision with lava
    if (Touching(p, p.x, p.y, 2) && !p.isDashing) {
        p.x = p.enteredX;
        p.y = p.enteredY;
    }
    if (Touching(p, p.x, p.y, 3)) {
        p.grav = 25;
        p.accel = 100;
        p.deccel = 200;
        p.maxSpd = 1000;
        p.jumpSpd = -750;
        p.fallSpd = 1000;
        p.lastState = 3;
        p.canJump = 1;
    } else {
        p.grav = Physics.grav;
        p.accel = Physics.accel;
        p.deccel = Physics.deccel;
        p.maxSpd = Physics.maxSpd;
        p.jumpSpd = Physics.jumpSpd;
        p.fallSpd = Physics.fallSpd;
        if (p.lastState == 3 && BTN[5]) { p.ySpd = p.jumpSpd; }
        p.lastState = 0;
    }

    if (p.canDash && BTN[6]>0) {
        BTN[6] = -1;
        p.isDashing = 1;
        p.dashTimer = 8;
    }

    if (p.isDashing) {
        p.color = 8;
        p.xSpd = 5000 * p.facing;
        p.ySpd = 0;
        p.maxSpd = 5000;
        p.canDash = 0;
        p.dashTimer = Math.max(p.dashTimer-1,0);
        if (p.dashTimer == 0) {
            p.color = p.id;
            p.isDashing = 0;
        }
    }
    
    checkScreenChange(p);

    if (!p.wallJumpDelay) {
        // Accelerate
        if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }
        
        // Deccelerate
        if (!AXIS[1]) {
            if ((p.xSpd > 0 && p.xSpd - (p.deccel * Math.sign(p.xSpd)) < 0) ||
            (p.xSpd < 0 && p.xSpd - (p.deccel * Math.sign(p.xSpd)) > 0)) {
                p.xSpd = 0;
            }
            p.xSpd -= (p.deccel * Math.sign(p.xSpd));
            if (!p.xSpd) { p.x =  Math.floor(p.x); }
        }
        p.xSpd = Clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    }
    if (Touching(p, p.x + (1 * Math.sign(p.xSpd)), p.y, 1)) {
        p.isOnWall = 1;
        p.canDash = 1;
    }
    else { p.isOnWall = 0; }
    
    // Wall jump
    if (p.isOnWall && !p.isOnGround && BTN[5]>0 && p.lastState != 3) {
        p.wallJumpDelay = 1;
        p.isOnWall = 0;
        p.xSpd = -Math.sign(p.xSpd) * p.maxSpd;
        jump(p);
    }
    // Jump
    if (BTN[5]>0 && p.canJump) { jump(p); }
    
    if (p.isOnWall) { p.xSpd = 0; }

    // Wall slide
    if (p.isOnWall && p.ySpd > 0 && p.lastState != 3) { p.ySpd = p.grav/2; }
    // Normal gravity
    else if (!p.isOnGround) { p.ySpd += p.grav; }

    p.ySpd = Clamp(p.ySpd,-p.fallSpd,p.fallSpd);
    
    // Horizontal collision
    if (Touching(p, p.x + (p.xSpd/1000), p.y, 1)) {
        while (!Touching(p, p.x + Math.sign(p.xSpd), p.y, 1)) { p.x += Math.sign(p.xSpd); }
        p.xSpd = 0;
    }
    p.x += (Math.abs(p.xSpd) / 1000) * Math.sign(p.xSpd);
    p.xInt = Math.floor(p.x);
    
    // Vertical collision
    if (Touching(p, p.x, p.y + (p.ySpd/1000), 1)) {
        while (!Touching(p, p.x, p.y + Math.sign(p.ySpd), 1)) { p.y += Math.sign(p.ySpd); }
        p.ySpd = 0;
    }
    //p.y += (p.ySpd / 1000);
    p.y += (Math.abs(p.ySpd) / 1000) * Math.sign(p.ySpd);
    p.yInt = Math.floor(p.y);

    /* -------------------------------------------------------------------------- */
    /*                                  ANIMATION                                 */
    /* -------------------------------------------------------------------------- */

    // Set rotation
    if (p.xSpd > 0) {
        p.sr = 0;
        p.facing = 1;
    }
    else if (p.xSpd < 0) {
        p.sr = 1;
        p.facing = -1;
    }

    // EMOTE
    if (p.isOnGround && !p.xSpd && AXIS[0] == 1) {
        p.st++;

        if (p.st == 6) {
            p.st = 0;
            // Continue animation
            if (p.animID == 0) { p.si = 0; p.sr = 0; }
            if (p.animID == 1) { p.si = 6; p.sr = 0; }
            if (p.animID == 2) { p.si = 6; p.sr = 1; }
            if (p.animID == 3) { p.si = 0; p.sr = 1; }
            if (p.animID == 4) { p.si = 6; p.sr = 1; }
            if (p.animID == 5) { p.si = 6; p.sr = 0; }
            p.animID++;
            if (p.animID == 6) { p.animID = 0; }
        }
    }
    // Idle
    else if (p.isOnGround && !p.xSpd) { p.si = 0; }
    // Run
    if (p.xSpd) {
        if (p.si == 0 && p.st == 0) { p.si = 1; }
        p.st++;

        if (p.st == 6) {
            p.st = 0;
            // Continue animation
            p.si++;
            if (p.si >= 5) {
                p.si = 1;
            }
        }
    }
    if (!p.isOnGround) {
        // Jumping & falling
        if (p.ySpd < 0) { p.si = 3; }
        if (p.ySpd > 0) { p.si = 4; }
    }
    // Wallslide
    if (p.isOnWall && !p.isOnGround && p.lastState != 3) { p.si = 5; }

    // UPDATE CAMERA
    //* Camera follows object
    if (WORLD.levels[p.screen].pxWid > SCREEN_WIDTH) {
        p.cam.x = p.x - (SCREEN_WIDTH / 2) - 4;
        p.cam.x = Clamp(p.cam.x, 0, WORLD.levels[p.screen].pxWid - SCREEN_WIDTH);
    } else { p.cam.x = 0; }
    if (WORLD.levels[p.screen].pxHei > SCREEN_HEIGHT) {
        p.cam.y = p.y - (SCREEN_HEIGHT / 2) - 4;
        p.cam.y = Clamp(p.cam.y, 0, WORLD.levels[p.screen].pxHei - SCREEN_HEIGHT);
    } else { p.cam.y = 0; }
}

function jump(p) {
    p.ySpd = p.jumpSpd;
    BTN[5] = -1;
    p.canJump = Math.max(p.canJump-1,0);
}

function checkScreenChange(obj) {
    let x = [0,0,0,0];
    let y = [0,0,0,0];

    let l = WORLD.levels[obj.screen].layerInstances[0].entityInstances;

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

    let l = WORLD.levels[obj.screen].layerInstances[1];

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