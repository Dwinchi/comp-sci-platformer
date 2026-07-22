import { lerp, clamp } from './util.js';
import * as initWorld from "../client/levels/World2.json";

console.clear();

const WORLD = initWorld.default;
const WORLD_ID = 2;
    
const socket = io(); // Loads from script from index.html 
// Shouldnt do this for an offline client version

const SCREEN_HEIGHT = 144;
const SCREEN_WIDTH = 256;
let SCALE = 1;

const DEFAULT_STRING = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_abcdefghijklmnopqrstuvwxyz{|}~`;

const uiLayer = document.getElementById("ui-layer") as HTMLCanvasElement;
const entityLayer = document.getElementById("entity-layer") as HTMLCanvasElement;
const screenLayer = document.getElementById("screen-layer") as HTMLCanvasElement;

const ctxUI = uiLayer.getContext("2d")!;
const ctxEntity = entityLayer.getContext("2d")!;
const ctxScreen = screenLayer.getContext("2d")!;

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

const keys = [
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
let localId = null;
let localPlayer = {
    playerId: null,
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
    maxJumps: 2,
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

let total_bananas = 33;

let text = [
    "COLLECT ALL THE BANANAS TO OPEN THE FINAL LEVEL",
    "The hungry squishy species is very rare",
    "PLEASE LEAVE THE JOHN ROOMm",
    "",
    "CONGRATS",
    "YOU DIDN'T THINK THIS WAS THE END, DID YOU?",
    "NOW SUFFER",
    "Z TO JUMP, X TO DASH",
    "YOU CAN DASH THROUGH LAVA",
    "We must save the last survivor"
]

function startTimer() {
    resize();
    TIMER = setInterval(update, (1000/60));
}

socket.on('initClient', function(data) {
    localId = data.localId;
    PLAYER_LIST = data.PLAYER_LIST;
    connected = 1;

    let l = WORLD.levels[data.screenId].layerInstances[0].entityInstances.find(({ __identifier }) => __identifier === "Player");
    
    localPlayer.socketId = data.socketId;
    localPlayer.playerId = data.localId;
    localPlayer.screen = data.screenId;
    localPlayer.x = l.px[0];
    localPlayer.y = l.px[1];
    localPlayer.xInt = localPlayer.x;
    localPlayer.yInt = localPlayer.y;
    localPlayer.enteredX = localPlayer.x;
    localPlayer.enteredY = localPlayer.y;
});

socket.on('updateClient', function(data: any) {
    // Update players
    //PLAYER_LIST = data.players;
    //PLAYER_LIST[PLAYER_LIST.indexOf(PLAYER_LIST.find(({ socketId }) => socketId === socketId))] = localPlayer;
    
    for (let i = 0; i < data.players.length; i++) {
        if (i != localId) {
            PLAYER_LIST[i] = data.players[i];
        }
    }

    //console.log(PLAYER_LIST);
});

function update() {
    tick();

    if (connected == 1) {
        //let id = PLAYER_LIST.indexOf(PLAYER_LIST.find(({ socketId }) => socketId === socketId));

        playerUpdate(localPlayer);

        let pack = {
            socketId: localPlayer.socketId,
            playerId: localPlayer.playerId,
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
        PLAYER_LIST[localId] = pack;
        socket.emit('updateServer', pack);

        draw();
    }
}

function draw() {
    // Clear canvases
    ctxEntity.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxScreen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxUI.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let cam = localPlayer.cam;
    cam.img = document.getElementById(`W${WORLD_ID}_Screen_${localPlayer.screen}`);
    ctxScreen.drawImage(cam.img,cam.x,cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
    
    for (let i of WORLD.levels[PLAYER_LIST[localId].screen].layerInstances[0].entityInstances) {
        if (i.__identifier == "Collectable" && i.fieldInstances[1].__value == 0) {
            let img = document.getElementById(`food-${i.fieldInstances[0].__value}`);
            ctxEntity.drawImage(img,0,0,8,8,i.px[0] - cam.x,i.px[1] - cam.y,8,8);
        } else if (i.__identifier == "Sign") {
            let img = document.getElementById(`sign`);
            ctxEntity.drawImage(img,0,0,8,8,i.px[0] - cam.x,i.px[1] - cam.y,8,8);
            if (touchSign) {
                let img = document.getElementById(`textbox`);
                ctxUI.drawImage(img,16,16);
                if (touchSign == "Done") {
                    drawText("That was yummy...", 26, 21, 7, 1);
                    drawText("Now I can star in my own game!", 26, 29, 7, 1);
                    drawText("(YOU HAVE FINISHED THE GAME)", 26, 37, 7, 1);  
                } else {
                    drawText(touchSign, 26, 21, 7, 1); 
                }
            }
        } else if (i.__identifier == "Hungry") {
            let img = document.getElementById(`hungry`);
            ctxEntity.drawImage(img,0,0,8,8,i.px[0] - cam.x,i.px[1] - cam.y,8,8);
        }
    }

    // Draw players
    for (let i = 0; i < PLAYER_LIST.length; i++) {
        let p = PLAYER_LIST[i];
        console.log(PLAYER_LIST.length);
        if (p != null && p.screen == PLAYER_LIST[localId].screen) {
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
                total_bananas--;
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
                if (i.fieldInstances[0].__value == 3 && total_bananas != 0) {
                    touchSign = `Please feed me ${total_bananas} yummy bananas :D`;
                } else if (i.fieldInstances[0].__value == 3 && total_bananas == 0) {
                    touchSign = "Done";
                }
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

    let l = WORLD.levels[obj.screen].layerInstances[1];

    let x1 = Math.floor(x / 8);
    let x2 = Math.floor((x + obj.w) / 8);
    let y1 = Math.floor(y / 8);
    let y2 = Math.floor((y + obj.h) / 8);

    let t0 = l.intGridCsv[x1 + (y1 * (l.__cWid))];
    let t1 = l.intGridCsv[x2 + (y1 * (l.__cWid))];
    let t2 = l.intGridCsv[x1 + (y2 * (l.__cWid))];
    let t3 = l.intGridCsv[x2 + (y2 * (l.__cWid))];

    if (t1 == checkFor || t0 == checkFor || t2 == checkFor || t3 == checkFor) {
        return checkFor;
    }

    return 0;
}

function drawText(text: String, x: number, y: number, clr: number, mode: number) {
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