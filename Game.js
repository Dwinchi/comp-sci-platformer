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
8 = j
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
    st:1,
    s:0,
    si:0,
    accel:0.5,
    deccel:0.25,
    maxSpd:2,
    jumpSpd:-4,
    xSpd:0,
    ySpd:0,
    canJump: false
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
    
    // If player is moving, speed up
    if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }

    // Jump
    if (BTN[7] && p.canJump) {
        p.ySpd = p.jumpSpd;
        p.canJump = 0;
        BTN[7] = 0;
    }

    // GRAVITY
    p.ySpd += grav;
    
    // If player isn't moving, slow down to a halt
    if (!AXIS[1]) {
        p.xSpd -= (p.deccel * Math.sign(p.xSpd));
        if (!p.xSpd) { p.x =  Math.floor(p.x); }
    }
    
    // LIMIT SPEED
    p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    p.ySpd = clamp(p.ySpd,-8,8);
    
    // Horizontal collision
    if (touching(p.x + p.xSpd, p.y, "x")) {
        while (!touching(p.x+Math.sign(p.xSpd), p.y, "x")) {
            p.x += Math.sign(p.xSpd);
        }

        // Wall grab
        if (touching(p.x+Math.sign(p.xSpd), p.y, "x")) {
            if (BTN[8] && BTN[7]) {
                p.ySpd = -4;
                p.xSpd = 8 * (Math.sign(p.xSpd) * -1);
            } else if (BTN[8] && !BTN[7]) {
                p.ySpd = 0;
            } else { p.ySpd = 0.1; }
        }

        p.xSpd = 0;
    }
    
    // Vertical collision
    if (touching(p.x, p.y + p.ySpd, "y")) {
        while (!touching(p.x, p.y + Math.sign(p.ySpd), "y")) {
            p.y += Math.sign(p.ySpd);
        }
        
        if (Math.sign(p.ySpd) == 1) {
            p.canJump = true;
        }
        
        p.ySpd = 0;
    } else { p.canJump = false; }

    if (p.st == 1) {
        // Normal running state
        
    } else if (p.st == 2) {
        // Jump state
        
    } else if (p.st == 3) {
        // Wall slide

        if (BTN[7]) {
            jump();
            p.xSpd = 8 * (Math.sign(p.xSpd) * -1);
            console.log("jumped", (Math.sign(p.xSpd) * -1));
        }
    } else if (p.st == 4) {
        // Wall grab
        if (BTN[7]) {
            jump();
            p.xSpd = 8 * (Math.sign(p.xSpd) * -1);
            console.log("jumped", (Math.sign(p.xSpd) * -1));
        }
    }
    
    p.x += p.xSpd;
    p.y += p.ySpd;
    
    draw();

    function SwitchState(state, obj) {
        obj.st = state;

        switch (obj.st) {
            case 0:
                
                break;
        
            case 1:
                break;
        }
        
    }

    function jump() {
        p.ySpd = p.jumpSpd;
    }
}

/* function movearrows() {
    for (let arrow of player.arrows) {
        // Shoot arrow
        if (!arrow && BTN[6]) {
            player.arrows[player.arrows.indexOf(arrow)] = {
                x: player.x + 15,
                y: player.y + 15,
                dir: player.dir
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
            let b = document.getElementById(`shot${player.arrows.indexOf(arrow)}`).style;
            b.left = `${x}px`;
            b.top = `${y}px`;
            
            arrow.x = x;
            arrow.y = y;
            
            // Checking if arrow is out of the screen
            if (arrow.x > window.innerWidth || arrow.y > window.innerHeight || arrow.x < 0 || arrow.y < 0) {
                player.arrows[player.arrows.indexOf(arrow)] = 0;
                b.left = `${-50}px`;
                b.top = `${-50}px`;
            }

            if ((player.x < arrow.x + 50) && (player.x + 50 < arrow.x) && (player.y < arrow.y + 50) && (player.y + 50 > arrow.y)) {}

            // Checking if arrow hit enemy and removing it
            if ((bad.x < arrow.x + 50) && (bad.x + 50 < arrow.x) && (bad.y < arrow.y + 50) && (bad.y + 50 > arrow.y)) {
                bad.x = 800;
                bad.y = 200;
                b.left = `${-50}px`;
                b.top = `${-50}px`;
                player.arrows[player.arrows.indexOf(arrow)] = 0;
            }
        
        }
    }
}
*/

function draw() {
    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);

    /* let x1 = Math.floor(p.x / 8);
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
    ctxEntity.fill(); */

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
    if (k == "j") { BTN[8] = s; }
    
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

function touching(x, y, dir) {
    let x1;
    let x2;
    let y1;
    let y2;
    let t0;
    let t1;
    let t2;
    let t3;
    
    let l = LAYER[1];

    if (dir == "x") {
        x1 = Math.floor((x) / 8);
        x2 = Math.floor((x + p.w) / 8);
        y1 = Math.floor(y / 8);
        y2 = Math.floor((y + p.h) / 8);
    } else if (dir == "y") {
        x1 = Math.floor(x / 8);
        x2 = Math.floor((x + p.w) / 8);
        y1 = Math.floor(y / 8);
        y2 = Math.floor((y + p.h) / 8);
    }

    t0 = TS.tiles[l.data[x1 + (y1 * l.gridCellsX)]];
    t1 = TS.tiles[l.data[x2 + (y1 * l.gridCellsX)]];
    t2 = TS.tiles[l.data[x1 + (y2 * l.gridCellsX)]];
    t3 = TS.tiles[l.data[x2 + (y2 * l.gridCellsX)]];

    // Vertical
    if (t1 == 1 || t0 == 1) {
        return true;
    } else if (t2 == 1 || t3 == 1) {
        return true;
    }
    
    // Horizontal
    if (t1 == 1 || t3 == 1) {
        return true;
    } else if (t0 == 1 || t2 == 1) {
        return true;
    }
}

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