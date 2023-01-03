console.clear();

import * as level from "./levels/1-1/1-1.json" assert { type: "json" };
import { Lerp, Clamp } from './Util.js';
import { Player } from "./Player.js";
import { MainMenu, Settings } from "./Menu.js";
let LAYERS = level.default.layers;

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

export let keys = [
    "w",
    "s",
    "a",
    "d",
    "shift",
    "tab",
    "e",
    " ",
]

let SCREEN_HEIGHT = 180;
let SCREEN_WIDTH = 320;

/* 
? Input button index
* 0 = up
* 1 = down
* 2 = left
* 3 = right
* 4 = shift
* 5 = tab
* 6 = e
* 7 = space
*/

export let BTN = [0,0,0,0,0,0,0,0];
export let AXIS = [0,0];

let p;

// Short for Game Controller
export let GC = {
    state: 0,
    music: "",
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

/* GC.level = "1-1"; */

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

//let p = new Player(10,10);

function startTimer() {
    resize();
    load(20);
    TIMER = setInterval(update, (1000/60));
}

function load(state) {
    if (state == 0) {
        menu = new MainMenu(20, 20, 280, 132);
    } if (state == 20) {
        settings = new Settings();
    } if (state == 50) {
        p = new Player(10,10);
        GC.level = "l1-1";
    }
}

function update() {
    tick();

    if (GC.state == 0) {
        for (const i of GC.obj.me) { i.update(); }
    }

    if (GC.state == 20) {
        
    }

    if (GC.state == 50) {
        // Gameplay state
        for (const i of GC.obj.en) { i.update(); }
        for (const i of GC.obj.se) { i.update(); }

        Camera(p);
    }
    
    draw();
    
    /* -------------------------------------------------------------------------- */
    /*                                   POWERS                                   */
    /* -------------------------------------------------------------------------- */
    // If player has bow
    /* if (p.power == 1) {
        p.canFire = true;
    }
    
    // If player has bow
    if (bowPwr) {
        canFire = true;
    }

    // Firing bow 
    if (p.canFire) {
        movearrows()
    } */

    function Camera(obj) { 
        //* Camera follows object
        Cam.img = document.getElementById(GC.level)

        if (LAYERS[1].gridCellsX > Math.ceil(SCREEN_WIDTH / 8)) {
            Cam.fxPos = obj.x - (SCREEN_WIDTH / 2) - 4;
            Cam.x = Lerp(Cam.x, Cam.fxPos, 0.1);
            Cam.x = Clamp(Cam.x, 0, (LAYERS[1].gridCellsX * 8) - SCREEN_WIDTH);
        }
        if (LAYERS[1].gridCellsY > Math.ceil(SCREEN_HEIGHT / 8)) {
            Cam.fyPos = obj.y - (SCREEN_HEIGHT / 2) - 4;
            Cam.y = Lerp(Cam.y, Cam.fyPos, 0.1);
            Cam.y = Clamp(Cam.y, 0, (LAYERS[1].gridCellsY * 8) - SCREEN_HEIGHT);
        }
    }

    /* function movearrows() {
        for (let arrow of p.arrows) {
            // Shoot arrow
            if (!arrow && BTN[6]) {
                p.arrows[p.arrows.indexOf(arrow)] = {
                    x: p.w,
                    y: p.h,
                    dir: p.dir
                };
                
                BTN[6] = 0;
            }
        
            // Move arrows
            if (arrow) {
                let x = arrow.x;
                let y = arrow.y;
                let dir = arrow.dir;
                let spd = 6;
        
                if (dir == 0) {
                    y -= spd;
                } else if (dir == 4) {
                    y += spd;
                } else if (dir == 2) {
                    x += spd;
                } else if (dir == 6) {
                    x -= spd;
                } else if (dir == 1) {
                    x += (spd / 2);
                    y -= (spd / 2);
                } else if (dir == 5) {
                    x -= (spd / 2);
                    y += (spd / 2);
                } else if (dir == 3) {
                    x += (spd / 2);
                    y += (spd / 2);
                } else if (dir == 7) {
                    x -= (spd / 2);
                    y -= (spd / 2);
                }
                
                // Set movement and angle
                let b = document.getElementById(`shot${p.arrows.indexOf(arrow)}`).style;
                b.left = `${x}px`;
                b.top = `${y}px`;
                
                arrow.x = x;
                arrow.y = y;
                
                // Checking if arrow is out of the screen
                if (arrow.x > window.innerWidth || arrow.y > window.innerHeight || arrow.x < 0 || arrow.y < 0) {
                    p.arrows[p.arrows.indexOf(arrow)] = 0;
                    b.left = `${-50}px`;
                    b.top = `${-50}px`;
                }
        
                if ((p.x < arrow.x + 50) && (p.x + 50 < arrow.x) && (p.y < arrow.y + 50) && (p.y + 50 > arrow.y)) {}
        
                // Checking if arrow hits opponent and removing it
                
            
            }
        }
    } */
}

function draw() {
    ctxEntity.imageSmoothingEnabled = false;
    ctxScreen.imageSmoothingEnabled = false;
    ctxUI.imageSmoothingEnabled = false;

    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);
    ctxScreen.clearRect(0, 0, cScreen.width, cScreen.height);
    ctxUI.clearRect(0, 0, cEntity.width, cEntity.height);

    if (GC.level != null) {
        ctxScreen.drawImage(Cam.img,Cam.x,Cam.y,320,180,0,0,320,180);
    }

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
}

document.addEventListener("keydown", function(e) { changeKey(e.key, 1) });
document.addEventListener("keyup", function(e) { changeKey(e.key, 0) });
window.addEventListener("resize", resize);

export function Transition(state, back) {
    GC.state = state;
    GC.back = back;

    while (GC.obj.me.length != 0) { GC.obj.me.shift(); }
    while (GC.obj.en.length != 0) { GC.obj.en.shift(); }
    while (GC.obj.se.length != 0) { GC.obj.se.shift(); }


    load(state);
    //p = new Player(10,10);
    //GC.level = "l1-1";
}

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
            ctxUI.drawImage(fontImg, DEFAULT_STRING.indexOf(char) * 4, 0, 4, 5, x + (i * 4), y, 4, 5);
        }
    }

    /* ctxUI.font = '14px Earthbound';
    ctxUI.fillStyle = color;
    ctxUI.textBaseline = 'top';
    ctxUI.fillText(text, x, y); */
}

window.onload = startTimer();