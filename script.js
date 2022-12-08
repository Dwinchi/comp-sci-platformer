console.clear();

import * as level from "./levels/L-0.json" assert { type: "json" };

// Initialize variables
/* 
0 = up
1 = down
2 = left
3 = right
4 = shift
5 = tab
6 = e
*/

let LEVEL = level.default.layers[0];

let tilesets = [
    {
        x: 4,
        y: 3,
        tiles: [1,1,1,1,1,1,1,0,1,1,1,0]
    }
];

let BTN = [0,0,0,0,0,0,0];
let AXIS = [0,0];
let TIMER;
let grav = 0.5;

var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;


let p = {
    x:0,
    y:0,
    img:document.getElementById("player-img"),
    sprite:0,
    accel:0.5,
    deccel:0.25,
    maxSpd:2,
    jumpSpd:6,
    xSpd:0,
    ySpd:0,
    physAtk:10,
    elemAtk:10,
    physDef:10,
    elemDef:10,
}

const cUI = document.getElementById("ui-layer");
const cEntity = document.getElementById("entity-layer");
const cScreen = document.getElementById("screen-layer");

let ctxUI = cUI.getContext("2d");
let ctxEntity = cEntity.getContext("2d");
let ctxScreen = cScreen.getContext("2d");

function startTimer() {
    resize();
    TIMER = setInterval(update, (1000/60));
}

function update() {
    tick();
    
    /* -------------------------------------------------------------------------- */
    /*                               Player movement                              */
    /* -------------------------------------------------------------------------- */
    
    // Check if sprinting
    if (BTN[4]) {
        p.maxSpd = 2;
        p.deccel = .5;
    } else if (!BTN[4]) {
        p.maxSpd = 2;
        p.deccel = .25;
    }
    
    // If player is moving, speed up
    if (AXIS[0]) { 
        p.ySpd += (p.jumpSpd*AXIS[0]);
        AXIS[0] = 0
    }
    if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }
    
    // If player isn't moving, slow down to a halt
    if (!AXIS[0]) {
        p.ySpd += grav
    }
    if (!AXIS[1]) {
        p.xSpd -= (p.deccel * Math.sign(p.xSpd));
        if (!p.xSpd) { p.x =  Math.floor(p.x); }
    }

    
    // NON-FUNCTIONAL, checks for collision with level
    if (Math.sign(p.ySpd) == 1) {
        let cx = Math.floor(p.x / LEVEL.gridCellsX);
        let cy = Math.floor(p.y + p.ySpd / LEVEL.gridCellsY);
        if (tilesets[0][LEVEL.data[cx + (cy * 10)]] == 1) { console.log("touched ground"); }
    }

    // LIMIT SPEED
    p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    p.ySpd = clamp(p.ySpd,-p.maxSpd,p.maxSpd);
    
    p.x += p.xSpd;
    p.y += p.ySpd;
    
    draw();
}

function draw() {
    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);
    ctxEntity.drawImage(p.img,Math.floor(p.x),Math.floor(p.y));
    
    renderMap(level.default.layers[0]);
}

function renderMap(m) {
    /* 
    offsets for moving maps
    ox = offset x
    oy = offset y
    ct = current tile
    t = tile
    ts = tileset
    cx = current x tile location
    cy = current y tile location
    */

	let cx = 0;
    let cy = 0;
    let ts = m.tileset;

    for (let ct = 0; ct < (m.gridCellsX * m.gridCellsY);  ct++) {
        let tg = parseInt(m.data[ct]);

        let oy = Math.floor(tg / 4);
        let ox = tg - (oy * 4);

        let img = document.getElementById(m.tileset);
        ctxScreen.drawImage(img,ox*8,oy*8,8,8,(cx * 8),(cy * 8),8,8);

        cx++;
        if (cx/m.gridCellsX == 1) { cy++; cx = 0; }
    }
}

function changeKey(key, state) {
    let k = key.toLowerCase();
    let s;
    
    if (state) { s = 1 }
    else if (!state) { s = 0; }
    
    if (k == "w") { BTN[0] = s; }
    if (k == "s") { BTN[1] = s; }
    if (k == "a") { BTN[2] = s; }
    if (k == "d") { BTN[3] = s; }
    if (k == "shift") { BTN[4] = s; }
    if (k == "tab") { BTN[5] = s; }
    if (k == "e") { BTN[6] = s; }


    
    // Set axis
    if (BTN[0] && !BTN[1]) {
        AXIS[0] = -1;
    } else if (!BTN[0] && BTN[1]) {
        AXIS[0] = 1;
    } else if ((!BTN[0] && !BTN[1]) || (BTN[0] && BTN[1])) {
        AXIS[0] = 0;
    }
    
    if (BTN[2] && !BTN[3]) {
        AXIS[1] = -1;
    } else if (!BTN[2] && BTN[3]) {
        AXIS[1] = 1;
    } else if ((!BTN[2] && !BTN[3]) || (BTN[2] && BTN[3])) {
        AXIS[1] = 0;
    }
}

document.addEventListener("keydown", function(e) { changeKey(e.key, 1) });
document.addEventListener("keyup", function(e) { changeKey(e.key, 0) });
window.addEventListener("resize", resize);

function resize() {
    let winWidth = Math.floor(window.innerHeight / 180);
    let winHeight = Math.floor(window.innerWidth / 320);
    let SCALE = Math.min(winWidth,winHeight);
    
    const layer = document.querySelectorAll('.game-layers');
    
    layer.forEach(l => {
        l.style.width = `${SCALE * 320}px`;
        l.style.height = `${SCALE * 180}px`;
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

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

window.onload = startTimer();