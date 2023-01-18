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

socket.on('assignID', function(data) {
    localID = data;
    console.log(localID);
});

socket.on('updateClient', function(data) {
    tick();
    // Pretty much just a new draw function
    ctxEntity.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxScreen.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctxUI.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    let players = data.players;
    let cam = players[localID].cam;
    cam.img = document.getElementById(`Level_${data.levelID}`);
    ctxScreen.drawImage(cam.img,cam.x,cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);

    // Update players
    for (let i = 0; i < players.length; i++) {
        let p = players[i];
        if (p != undefined) {
            let img = document.getElementById(`p${i}`);
            ctxEntity.drawImage(img,8 * p.si,8 * p.sr,8,8,p.x - cam.x, p.y - cam.y,8,8);
        }
    }
});

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
    console.log(window.innerHeight / SCREEN_HEIGHT,window.innerWidth / SCREEN_WIDTH);
    
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