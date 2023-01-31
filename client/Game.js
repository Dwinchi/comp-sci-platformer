import { Lerp, Clamp } from './Util.js';
import * as initWORLD from "./levels/World2.json" assert { type: "json" };

console.clear();

let WORLD = initWORLD.default;
let WORLD_ID = 2;

let socket = io();

let SCREEN_HEIGHT = 144;
let SCREEN_WIDTH = 256;
let SCALE = 1;

let DEFAULT_STRING = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_abcdefghijklmnopqrstuvwxyz{|}~`;

let ctxUI = document.getElementById("ui-layer").getContext("2d");
let ctxEntity = document.getElementById("entity-layer").getContext("2d");
let ctxScreen = document.getElementById("screen-layer").getContext("2d");
let ctxText = document.getElementById("text-layer").getContext("2d");

ctxEntity.imageSmoothingEnabled = false;
ctxScreen.imageSmoothingEnabled = false;
ctxUI.imageSmoothingEnabled = false;

let TIMER;
var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

let touchSign = 0;

let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 1500,
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
    "m"
]

let BTN = [0,0,0,0,0,0,0,0];
let AXIS = [0,0];
let localID = null;
let localPlayer = {
    playerID: null,
    color: null,
    colorSave: null,
    name: "localName",
    w: 7,
    h: 7,
    screen: null,
    xSpd: 0,
    ySpd: 0,
    BTN: [0,0,0,0],
    AXIS: [0,0],
    lastState: 0,
    bananaCounter: 0,
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
    dashDir: 0,
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
};
let localName = null;
let localColor = null;
let PLAYER_LIST = [];
let connected = 0;

let text = [
    "COLLECT ALL THE BANANAS TO OPEN THE FINAL LEVEL",
    "NOTHING TO DO HERE...",
    "VERY OMINOUS",
    "PRESS UP TO GO THROUGH DOOR",
    "CONGRATS",
    "YOU DIDN'T THINK THIS WAS THE END, DID YOU?",
    "NOW SUFFER",
]

function startTimer() {
    resize();
    TIMER = setInterval(update, (1000/60));
}

socket.on('initClient', function(data) {
    localID = data.localID;
    PLAYER_LIST = data.PLAYER_LIST;
    connected = 1;

    let l = WORLD.levels[data.screenID].layerInstances[0].entityInstances.find(({ __identifier }) => __identifier === "Player");
    
    localPlayer.socketID = data.socketID;
    localPlayer.playerID = data.localID;
    localPlayer.screen = data.screenID;
    localPlayer.x = l.px[0];
    localPlayer.y = l.px[1];
    localPlayer.xInt = localPlayer.x;
    localPlayer.yInt = localPlayer.y;
    localPlayer.enteredX = localPlayer.x;
    localPlayer.enteredY = localPlayer.y;
});

socket.on('updateClient', function(data) {
    // Update players
    PLAYER_LIST = data.players;
    PLAYER_LIST[PLAYER_LIST.indexOf(PLAYER_LIST.find(({ socketID }) => socketID === socketID))] = localPlayer;
    
    for (let i = 0; i < data.players.length; i++) {
        if (i != localID) {
            PLAYER_LIST[i] = data.players[i]
        }
    }

    //console.log(PLAYER_LIST);
});

function update() {
    tick();

    if (connected == 1) {
        //let id = PLAYER_LIST.indexOf(PLAYER_LIST.find(({ socketID }) => socketID === socketID));

        playerUpdate(localPlayer);

        let pack = {
            socketID: localPlayer.socketID,
            playerID: localPlayer.playerID,
            name: localPlayer.name,
            color: localPlayer.color,
            x: localPlayer.x,
            y: localPlayer.y,
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
    cam.img = document.getElementById(`W${WORLD_ID}_Screen_${localPlayer.screen}`);
    ctxScreen.drawImage(cam.img,cam.x,cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
    
    for (let i of WORLD.levels[PLAYER_LIST[localID].screen].layerInstances[0].entityInstances) {
        if (i.__identifier == "Collectable" && i.fieldInstances[1].__value == 0) {
            let img = document.getElementById(`food-${i.fieldInstances[0].__value}`);
            ctxEntity.drawImage(img,0,0,8,8,i.px[0] - cam.x,i.px[1] - cam.y,8,8);
        } else if (i.__identifier == "Sign") {
            let img = document.getElementById(`sign`);
            ctxEntity.drawImage(img,0,0,8,8,i.px[0] - cam.x,i.px[1] - cam.y,8,8);
            if (touchSign) {
                let img = document.getElementById(`textbox`);
                ctxUI.drawImage(img,16,16);
                drawText(touchSign, 26, 21, 7, 1); 
            }
        }
    }

    // Draw players
    for (let i = 0; i < PLAYER_LIST.length; i++) {
        let p = PLAYER_LIST[i];
        console.log(PLAYER_LIST.length);
        if (p != null && p.screen == PLAYER_LIST[localID].screen) {
            // Draw name
            let txt = document.getElementById(`p${i}-name`);
            if (txt == null) {
                let txt = document.createElement("span");
                txt.className = "player-names";
                txt.id = `p${i}-name`;
                document.getElementById("names").append(txt);
            }
            txt.innerHTML = p.name;
            txt.style.display = "block";
            txt.style.left = `${Math.floor((p.x+4 - cam.x) * SCALE) - Math.floor(txt.getBoundingClientRect().width/2)}px`;
            txt.style.top = `${Math.floor((p.y - cam.y) * SCALE) - 24}px`;
            // Draw player
            let img = document.getElementById(`p${p.color}`);
            ctxEntity.drawImage(img,8 * p.si,8 * p.sr,8,8,p.xInt - cam.x, p.yInt - cam.y,8,8);
        } else {
            let txt = document.getElementById(`p${i}-name`);
            if (txt != null) { txt.style.display = "none"; }
        }
    }
    let img = document.getElementById(`food-0`);
    ctxEntity.drawImage(img,0,0,8,8,2,8,8,8);
    drawText(localPlayer.bananaCounter.toString(), 11, 10, 7);
    
    if (BTN[7]) {
        // Map
        let img = document.getElementById(`map`);
        ctxUI.drawImage(img,0,0);
    }
}

function playerUpdate(p) {
    touchSign = 0;
    /* -------------------------------------------------------------------------- */
    /*                               Player movement                              */
    /* -------------------------------------------------------------------------- */
    if (Touching(p, p.x, p.y + 1, 1)) {
        p.isOnGround = 1;
        p.canJump = p.maxJumps;
        p.canDash = 1;
        p.color = p.colorSave;
    }
    else { p.isOnGround = 0; }
    p.wallJumpDelay = Math.max(p.wallJumpDelay-1,0);

    if (AXIS[1] != 0) { p.facing = AXIS[1] }

    // Collision with lava
    if (Touching(p, p.x, p.y, 2) && !p.isDashing) {
        p.x = p.enteredX;
        p.y = p.enteredY;
    }
    // In water
    if (Touching(p, p.x, p.y, 3)) {
        p.grav = 25;
        p.accel = 100;
        p.deccel = 200;
        p.maxSpd = 1000;
        p.jumpSpd = -1500;
        p.fallSpd = 1000;
        p.lastState = 3;
        p.canJump = 1;
        p.canDash = 1;
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
        p.dashTimer = 12;
        p.xSpd = 3000 * p.facing;
        p.ySpd = 0;
        p.color = 8;
    }

    if (p.isDashing) {
        // diagonal is * 0.707 or 2121;
        p.grav = 0;
        p.maxSpd = 3000;
        p.canDash = 0;
        p.dashTimer = Math.max(p.dashTimer-1,0);
        if (p.dashTimer == 0) {
            p.xSpd = 0;
            p.ySpd = 0;
            p.grav = Physics.grav;
            p.isDashing = 0;
        }
    }
    
    entityCollisions(p);

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
    }
    else { p.isOnWall = 0; }
    
    // Wall jump
    if (p.isOnWall && !p.isOnGround && BTN[5]>0 && p.lastState != 3) {
        p.wallJumpDelay = 1;
        p.isOnWall = 0;
        p.xSpd = -Math.sign(p.xSpd) * p.maxSpd;
        p.ySpd = p.jumpSpd;
        BTN[5] = -1;
        //jump(p);
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
    if (p.xSpd > 0) { p.sr = 0; }
    else if (p.xSpd < 0) { p.sr = 1; }

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
    //p.canDash = 1;
    p.dashTimer = 0;
    p.isDashing = 0;
}

function changeKey(key, state) {
    if (key != undefined) {
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
}

document.addEventListener("keydown", function(e) { changeKey(e.key, 1) });
document.addEventListener("keyup", function(e) { changeKey(e.key, 0) });
window.addEventListener("resize", resize);
document.getElementById("name-submit").addEventListener("click", function() {
    let name = document.getElementById("name-type").value;
    if (name != "" && name.length <= 32) {
        localPlayer.name = name;
        localPlayer.color = document.getElementById("name-color").value;
        localPlayer.colorSave = localPlayer.color;
        document.getElementById("name-input").style.display = "none";
        socket.emit('submitPlayer', localPlayer.name);
    } else {
        document.getElementById("name-warn").style.display = "block";
    }
});

function resize() {
    let winW = window.innerHeight / SCREEN_HEIGHT;
    let winH = window.innerWidth / SCREEN_WIDTH;
    SCALE = Math.min(winW,winH);
    
    const layer = document.querySelectorAll('.game-layers');
    
    layer.forEach(l => {
        l.style.width = `${Math.floor(SCALE * SCREEN_WIDTH)}px`;
        l.style.height = `${Math.floor(SCALE * SCREEN_HEIGHT)}px`;
    });

    document.getElementById("name-input").style.width =`${Math.floor(SCALE * SCREEN_WIDTH)}px`;
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


function entityCollisions(obj) {
    let x = [0,0,0,0];
    let y = [0,0,0,0];

    let l = WORLD.levels[obj.screen].layerInstances[0].entityInstances;

    for (let i of l) {
        x[0] = obj.x;
        x[1] = obj.x + obj.w;
        x[2] = i.px[0];
        x[3] = i.px[0] + i.width;
        y[0] = obj.y;
        y[1] = obj.y + obj.h;
        y[2] = i.px[1];
        y[3] = i.px[1] + i.height;
        
    
        if (x[0] <= x[3] &&
            x[1] >= x[2] &&
            y[0] <= y[3] &&
            y[1] >= y[2]) {
            if (i.__identifier == "Collectable" && !i.fieldInstances[1].__value) {
                i.fieldInstances[1].__value = 1;
                localPlayer.bananaCounter++;
            } else if (i.__identifier == "Change_Area") {
                let nextScreen = i.fieldInstances[0].__value;
                let nextDir = i.fieldInstances[1].__value;
                let ol = WORLD.levels[nextScreen].layerInstances[0].entityInstances.find(({ iid }) => iid == i.fieldInstances[2].__value.entityIid);
                let newX = obj.x - i.px[0] + ol.px[0];
                let newY = obj.y - i.px[1] + ol.px[1];
                
                obj.screen = nextScreen;
                if (nextDir == 1) { obj.x = ol.px[0] + 2; obj.y = newY; }
                if (nextDir == 3) { obj.x = ol.px[0] - 8; obj.y = newY; }
                if (nextDir == 0) { obj.y = ol.px[1] - 8; obj.x = newX; }
                if (nextDir == 2) { obj.y = ol.px[1] + 2; obj.x = newX; }
    
                obj.enteredX = obj.x;
                obj.enteredY = obj.y;
            } else if (i.__identifier == "Sign") {
                touchSign = text[i.fieldInstances[0].__value];
            } else if (i.__identifier == "DoubleJump") {
                obj.maxJumps = 2;
            } else if (i.__identifier == "Door" && BTN[0]>0) {
                BTN[0] = -1;
                let nextScreen = i.fieldInstances[0].__value;
                let ol = WORLD.levels[nextScreen].layerInstances[0].entityInstances.find(({ iid }) => iid == i.fieldInstances[1].__value.entityIid);
                let newX = ol.px[0];
                let newY = ol.px[1] + 8;
                obj.screen = nextScreen;
                obj.x = newX;
                obj.y = newY;

                obj.enteredX = obj.x;
                obj.enteredY = obj.y;
            } else if (i.__identifier == "JumpCrystal") {
                canDash = 1;
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

function drawText(text, x, y, clr, mode) {
    clr = clr || 0;
    mode = mode || 0;
    let fontImg = document.getElementById(`mainfont-${clr}`);

    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        
        if (char != " ") {
            ctxUI.drawImage(fontImg, DEFAULT_STRING.indexOf(char) * 4, 0, 4, 5, x + (i * 4), y, 4, 5);
        }
    }
}