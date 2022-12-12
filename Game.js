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
    w:7,
    h:7,
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
    

    // !DISABLE GRAVITY TO TEST COLLISIONS

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
    
    if (!p.isOnGround) {
        p.ySpd += grav;
    }

    // If player isn't moving, slow down to a halt
    if (!AXIS[1]) {
        p.xSpd -= (p.deccel * Math.sign(p.xSpd));
        if (!p.xSpd) { p.x =  Math.floor(p.x); }
    }

    // LIMIT SPEED
    p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    p.ySpd = clamp(p.ySpd,-8,8);

    //testing();

    p.x += p.xSpd;
    p.y += p.ySpd;

    BetterCheckCollision();

    draw();

    function testing() {
        // PHYSICS
        if (AXIS[0]) { p.ySpd += (p.accel*AXIS[0]); }
        if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }
        // PHYSICS
        if (!AXIS[0]) {
            p.ySpd -= (p.deccel * Math.sign(p.ySpd));
            if (!p.ySpd) { p.y = Math.floor(p.y); }
        }
        if (!AXIS[1]) {
            p.xSpd -= (p.deccel * Math.sign(p.xSpd));
            if (!p.xSpd) { p.x =  Math.floor(p.x); }
        }
        // LIMIT SPEED
        p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
        p.ySpd = clamp(p.ySpd,-p.maxSpd,p.maxSpd);
    }

    function BetterCheckCollision() {        
        for (let turn = 0; turn < 2; turn++) {
            let x1 = Math.floor(p.x / 8);
            let x2 = Math.floor((p.x + p.w) / 8);
            let y1 = Math.floor(p.y / 8);
            let y2 = Math.floor((p.y + p.h) / 8);
            
            let l = LAYER[1];
    
            let t0 = TS.tiles[l.data[x1 + (y1 * l.gridCellsX)]];
            let t1 = TS.tiles[l.data[x2 + (y1 * l.gridCellsX)]];
            let t2 = TS.tiles[l.data[x1 + (y2 * l.gridCellsX)]];
            let t3 = TS.tiles[l.data[x2 + (y2 * l.gridCellsX)]];

            // Horizontal
            if (p.xSpd != 0 && turn == 0) {
                if (
                    t1 == 1 ||
                    t3 == 1
                    ) {
                    p.xSpd = 0;
                    p.x = x1 * 8;
                } else if (
                    t0 == 1 ||
                    t2 == 1
                    ) {
                    p.xSpd = 0;
                    p.x = x2 * 8;
                }
            }
    
            // Vertical
            if (p.ySpd != 0 && turn == 1) {
                if (
                    t1 == 1 ||
                    t0 == 1
                    ) {
                    p.ySpd = 0;
                    p.y = (y2) * 8;
                } else if (
                    t2 == 1 ||
                    t3 == 1
                    ) {
                    p.ySpd = 0;
                    p.y = y1 * 8;
                    p.isOnGround = true;
                } else if (
                    t2 != 1 ||
                    t3 != 1
                ) { p.isOnGround = false; }
            }
        }
    }

    function CheckCollision() {
        // Working a bit?
        let cx = Math.floor((p.x + p.xSpd) / 8);
        let cy = Math.floor((p.y + p.ySpd) / 8);

        ctxEntity.beginPath();
        ctxEntity.rect(cx * 8, cy * 8, 8, 8);
        ctxEntity.fillStyle = "red";
        ctxEntity.fill();

        let l = LAYER[1];
        
        // Horizontal
        if (
/*             TS.tiles[l.data[cx + (cy * l.gridCellsX)]] == 1 ||
 */            TS.tiles[l.data[(cx+1) + (cy * l.gridCellsX)]] == 1
            ) {
            console.log("horizontal collision");
            p.xSpd = 0;
            /* p.x = (cx+1) * 8; */
            p.x = (cx) * 8;
        }
        if (
            TS.tiles[l.data[(cx+1) + ((cy+1) * l.gridCellsX)]] == 1 ||
            TS.tiles[l.data[cx + ((cy+1) * l.gridCellsX)]] == 1
            ) {
            p.ySpd = 0;
            p.y = cy * 8;
            p.isOnGround = true;
        } else if (
            TS.tiles[l.data[(cx+1) + ((cy+1) * l.gridCellsX)]] != 1 ||
            TS.tiles[l.data[cx + ((cy+1) * l.gridCellsX)]] != 1
        ) { p.isOnGround = false; }
    }

}

function draw() {
    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);

    let x1 = Math.floor(p.x / 8);
    let x2 = Math.floor((p.x + p.w) / 8);
    let y1 = Math.floor(p.y / 8);
    let y2 = Math.floor((p.y + p.h) / 8);

    ctxEntity.beginPath();
    ctxEntity.rect(x1 * 8, y1 * 8, 4, 4);
    ctxEntity.fillStyle = "#c06852";
    ctxEntity.fill();

    ctxEntity.beginPath();
    ctxEntity.rect(x2 * 8 + 4, y1 * 8, 4, 4);
    ctxEntity.fillStyle = "#5a78b2";
    ctxEntity.fill();

    ctxEntity.beginPath();
    ctxEntity.rect(x1 * 8, y2 * 8 + 4, 4, 4);
    ctxEntity.fillStyle = "#6ec077";
    ctxEntity.fill();
    
    ctxEntity.beginPath();
    ctxEntity.rect(x2 * 8 + 4, y2 * 8 + 4, 4, 4);
    ctxEntity.fillStyle = "#f5c47c";
    ctxEntity.fill();

    ctxEntity.drawImage(p.img,Math.floor(p.x),Math.floor(p.y));
    
    renderMap();
}

function renderMap() {
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
    //let ts = l.tileset;
    
    for (let l of LAYER) {
        for (let ct = 0; ct < (l.gridCellsX * l.gridCellsY);  ct++) {
            // Change LAYER[1] to l once done
            let tg = parseInt(LAYER[1].data[ct]);
    
            let oy = Math.floor(tg / 4);
            let ox = tg - (oy * 4);
    
            let img = document.getElementById(l.tileset);
            ctxScreen.drawImage(img,ox*8,oy*8,8,8,(cx * 8),(cy * 8),8,8);
    
            cx++;
            if (cx/l.gridCellsX == 1) { cy++; cx = 0; }
        }
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