console.clear();

let socket = io();

import { Lerp, Clamp } from './Util.js';
import { Player } from "./Player.js";
import { MainMenu, Settings } from "./Menu.js";

export let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 2000,
    jumpSpd: -3500,
}

export let CLRS = [
    "#000000",
    "#1d2b53",
    "#008751",
    "#AB5236",
    "#5F574F",
    "#C2C3C7",
    "#FFF1E8",
    "#FF004D",
    "#FFA300",
    "#FFEC27",
    "#00E436",
    "#29ADFF",
    "#83769C",
    "#FF77A8",
    "#FFCCAA"
]

let SCREEN_HEIGHT = 144;
let SCREEN_WIDTH = 256;

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

let p;

// Short for Game Controller

/**
 * STATES
 * 1 = Main menu
 * 10 = Multiplayer lobby selection screen
 * 20 = Settings screen
 * 50 = Multiplayer mode
 */
export let GC = {
    id: null,
    state: 50,
    music: "",
    levelID: "Level_3",
    level: null,
    gameMode: 0,
    back: null,
    obj: {
        /*
        * me = menu
        * se = settings
        * en = entities
        */
        me: [],
        se: [],
        en: []
    }
}

let DEFAULT_STRING = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_abcdefghijklmnopqrstuvwxyz{|}~`;

let TIMER;
var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

// Camera
export let Cam = {
    x:0,
    y:0,
    img: null,
}

const cUI = document.getElementById("ui-layer");
const cEntity = document.getElementById("entity-layer");
const cScreen = document.getElementById("screen-layer");

let ctxUI = cUI.getContext("2d");
let ctxEntity = cEntity.getContext("2d");
let ctxScreen = cScreen.getContext("2d");

export let menu = null;
export let settings = null;

socket.on('id', function(data) {
    GC.id = data.PlayerID;
    p = new Player(GC.level.entities.Player[0].x,GC.level.entities.Player[0].y);
});

socket.on('update', function(data) {
    //console.log(data);
});

function startTimer() {
    resize();
    load(GC.state);
    TIMER = setInterval(update, (1000/60));
}

export function Transition(state, back) {
    back = back || null;
    GC.back = back;

    if (state != 20) {
        while (GC.obj.me.length != 0) { GC.obj.me.shift(); }
        while (GC.obj.en.length != 0) { GC.obj.en.shift(); }
        while (GC.obj.se.length != 0) { GC.obj.se.shift(); }
    }

    load(state);
}

function load(state) {
    GC.state = state;

    if (state == 1) {
        menu = new MainMenu(20, 10, 216, 124);
    } if (state == 10) {
        lobby = new lobby();
    } if (state == 20) {
        settings = new Settings();
    } if (state == 50) {
        GC.level = JSON.parse(Get(`./client/levels/World1/simplified/${GC.levelID}/data.json`));
        GC.level.data = JSON.parse("[" + Get(`./client/levels/World1/simplified/${GC.levelID}/IntGrid.csv`) + "]");
    }
}

function update() {
    tick();

    if (GC.state == 1) {
        for (const i of GC.obj.me) { i.update(); }
    }

    if (GC.state == 10) {
        for (const i of GC.obj.me) { i.update(); }
    }

    if (GC.state == 20) {
        for (const i of GC.obj.se) { i.update(); }
    }

    if (GC.state == 50) {
        // Gameplay state
        for (const i of GC.obj.en) { i.update(); }

        Camera(p);
    }

    draw();

    function Camera(obj) { 
        //* Camera follows object
        Cam.img = document.getElementById(GC.level.identifier);

        if (GC.level.width > SCREEN_WIDTH) {
            Cam.fxPos = obj.x - (SCREEN_WIDTH / 2) - 4;
            Cam.x = Lerp(Cam.x, Cam.fxPos, 0.1);
            Cam.x = Clamp(Cam.x, 0, GC.level.width - SCREEN_WIDTH);
        }
        if (GC.level.height > SCREEN_HEIGHT) {
            Cam.fyPos = obj.y - (SCREEN_HEIGHT / 2) - 4;
            Cam.y = Lerp(Cam.y, Cam.fyPos, 0.1);
            Cam.y = Clamp(Cam.y, 0, GC.level.height - SCREEN_HEIGHT);
        }
    }
}

function draw() {
    ctxEntity.imageSmoothingEnabled = false;
    ctxScreen.imageSmoothingEnabled = false;
    ctxUI.imageSmoothingEnabled = false;

    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);
    ctxScreen.clearRect(0, 0, cScreen.width, cScreen.height);
    ctxUI.clearRect(0, 0, cEntity.width, cEntity.height);

    if (GC.level != null) { ctxScreen.drawImage(Cam.img,Cam.x,Cam.y,SCREEN_WIDTH,SCREEN_HEIGHT,0,0,SCREEN_WIDTH,SCREEN_HEIGHT); }

    for (const i of GC.obj.me) { i.draw(ctxEntity); }
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
    let winW = Math.floor(window.innerHeight / SCREEN_HEIGHT);
    let winH = Math.floor(window.innerWidth / SCREEN_WIDTH);
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

export function drawText(text, x, y, clr) {
    clr = clr || 0;
    let fontImg = document.getElementById(`mainfont-${clr}`);

    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        
        if (char != " ") {
            ctxEntity.drawImage(fontImg, DEFAULT_STRING.indexOf(char) * 4, 0, 4, 5, x + (i * 4), y, 4, 5);
        }
    }
}

function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

class lobby {
    constructor(x, y , width, height) {
        GC.obj.me.push(this);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.select = 0
        this.layer = 0;

        this.txt = [
            "Join lobby",
            "Create lobby"
        ]
    }

    update() { 
        if (BTN[3]>0) { this.select--; BTN[3] = -1; }
        if (BTN[2]>0) { this.select++; BTN[2] = -1; }

        if (this.select < 0) { this.select = 1; }
        if (this.select > 1) { this.select = 0; }

        if (BTN[4]>0) {
            BTN[4] = -1;
            if (this.layer == 0) {
                if (GC.back == 50) {
                    while (GC.obj.se.length != 0) { GC.obj.se.shift(); }
                    GC.state = 50;
                } else { Transition(GC.back); }
            }
        }
    }

    draw(ctx) {
        let img = document.getElementById("settings");
        ctx.drawImage(img,0,0);

        let clr0 = 7;
        let clr1 = 7;

        if (this.layer == 0 && this.select == 0) { clr0 = 10; }
        if (this.layer == 0 && this.select == 1) { clr1 = 10; }

        drawText(this.txt[0], (256/2) - this.txt[0].length*6, 136, clr0);
        drawText(this.txt[1], (256/2) + 1, 136, clr1);
    }
}

window.onload = startTimer();