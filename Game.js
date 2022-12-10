console.clear();

import * as level from "./levels/L-0b.json" assert { type: "json" };
let LAYER = level.default.layers;

// Initialize variables
/* 
0 = up
1 = down
2 = left
3 = right
4 = shift
5 = tab
6 = e
7 = space
*/

let LEVEL = level.default.layers[0];

let BOXES = [
    {
        x: 0,
        y: 144,
        w: 320,
        h: 40
    },
    {
        x: 64,
        y: 112,
        w: 8,
        h: 8
    },
    {
        x: 88,
        y: 96,
        w: 40,
        h: 16
    },
    {
        x: 136,
        y: 112,
        w: 8,
        h: 8
    },
]

// TS means Tilesets
let TS = {
    x: 4,
    y: 3,
    tiles: [1,1,1,1,1,1,1,0,1,1,1,0]
};

let BTN = [0,0,0,0,0,0,0,0];
let AXIS = [0,0];
let TIMER;
let grav = 0.2;

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
    jumpSpd:-4,
    xSpd:0,
    ySpd:0,
    physAtk:10,
    elemAtk:10,
    physDef:10,
    elemDef:10,
    isOnGround: false
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
    if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }

    // INPUT
    if (BTN[7] && p.isOnGround) { p.ySpd = p.jumpSpd; }
    // GRAVITY
    p.ySpd += grav;

    // If player isn't moving, slow down to a halt
    if (!AXIS[1]) {
        p.xSpd -= (p.deccel * Math.sign(p.xSpd));
        if (!p.xSpd) { p.x =  Math.floor(p.x); }
    }

    CheckCollision();
    
    // LIMIT SPEED
    p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    p.ySpd = clamp(p.ySpd,-8,8);
    
    p.x += p.xSpd;
    p.y += p.ySpd;
    
    draw();

    function CheckCollision() {
        // NON-FUNCTIONAL, checks for collision with level
        let cx = Math.floor(p.x / 8);
        let cy = Math.floor((p.y + p.ySpd) / 8);

        
        if (TS.tiles[LAYER[1].data[cx + ((cy+1) * LAYER[1].gridCellsX)]] == 1) {
            p.ySpd = 0;
            p.y = cy * 8;
            p.isOnGround = true;
        } else if (TS.tiles[LAYER[1].data[cx + ((cy+1) * LAYER[1].gridCellsX)]] == 0) { p.isOnGround = false; }
        
        console.log(TS.tiles[LAYER[1].data[cx + ((cy+1) * LAYER[1].gridCellsX)]], p.isOnGround);
    }

    function OGCheckCollision() {
        // NON-FUNCTIONAL, checks for collision with level
        let cx = Math.floor(p.x / 8);
        let cy = Math.floor(p.y / 8);

        if (!p.isOnGround && tilesets.tiles[LEVEL.data[cx + ((cy+1) * LEVEL.gridCellsX)]] == 1) {
            p.ySpd = 0;
            p.y = Math.floor(p.y / 8) * 8;
            p.isOnGround = true;
        } else if (p.isOnGround && tilesets.tiles[LEVEL.data[cx + ((cy+1) * LEVEL.gridCellsX)]] == 0) { p.isOnGround = false; }

        if (!p.isOnGround && tilesets.tiles[LEVEL.data[(cx+1) + ((cy+1) * LEVEL.gridCellsX)]] == 1) {
            p.ySpd = 0;
            p.y = Math.floor(p.y / 8) * 8;
            p.isOnGround = true;
        } else if (p.isOnGround && tilesets.tiles[LEVEL.data[(cx+1) + ((cy+1) * LEVEL.gridCellsX)]] == 0) { p.isOnGround = false; }

        console.log(p.isOnGround);
    }

    function BetterCheckCollision() {
        // Improving collisions detection

        for (const b of BOXES) {
            /* if (p.x + p.w >= b.x &&
                p.x <= b.x + b.w &&
                p.y + p.h >= b.y &&
                p.y <= b.y + b.h
            ) {
                return true
            } */
            console.log(p.y, b.y);
            if (p.x + p.w >= b.x &&
                p.x <= b.x + b.w &&
                p.y + p.h >= b.y &&
                p.y <= b.y + b.h
            ) {
                console.log("in");
                if (Math.sign(p.ySpd) == 1) {
                    p.y = b.y - p.h
                } /* else if (Math.sign(p.ySpd) == -1) {
                    p.y = b.y
                } */
                p.ySpd = 0;
            }
        }
    }
}

function draw() {
    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);
    
    ctxEntity.beginPath();
    ctxEntity.rect(Math.floor(p.x), Math.floor(p.y), 8, 8);
    ctxEntity.fillStyle = "red";
    ctxEntity.fill();
    
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
    if (k == " ") { BTN[7] = s; }
    
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