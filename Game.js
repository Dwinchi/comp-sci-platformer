console.clear();

import * as level from "./levels/L-0b.json" assert { type: "json" };
let LAYER = level.default.layers;

// Initialize variables
/* 
* 0 = up
* 1 = down
* 2 = left
* 3 = right
* 4 = shift
* 5 = tab
* 6 = e
* 7 = space
* 8 = j
*/

// TS means Tilesets
let TS = {
    x: 4,
    y: 3,
    tiles: [1,1,1,1,1,1,1,0,1,1,1,0]
};

let BTN = [0,0,0,0,0,0,0,0];
let AXIS = [0,0];
let TIMER;
let grav = 200;

var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

// Making all forces into 1000 based (1000 == 1)
let p = {
    x:10,
    y:10,
    w:7,
    h:7,
    img:document.getElementById("player-img"),
    st:1,
    s:0,
    si:0,
    sr:0,
    st:0,
    accel:500,
    deccel:250,
    maxSpd:2000,
    jumpSpd:-3000,
    xSpd:0,
    ySpd:0,
    // states
    canJump: false,
    isOnWall: false,
    //powers
    arrows: [0,0,0],
    canFire: false,
    power: false,
}

// Camera
let cam = {
    x:0,
    y:0
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
    //testing();
    /* -------------------------------------------------------------------------- */
    /*                               Player movement                              */
    /* -------------------------------------------------------------------------- */
    // Accelerate
    if (AXIS[1]) { p.xSpd += (p.accel*AXIS[1]); }
    
    // Deccelerate
    if (!AXIS[1]) {
        p.xSpd -= (p.deccel * Math.sign(p.xSpd));
        if (!p.xSpd) { p.x =  Math.floor(p.x); }
    }

    // Jump
    if (BTN[7] && p.canJump) {
        p.ySpd = p.jumpSpd;
        p.canJump = 0;
        BTN[7] = 0;
    }

    // GRAVITY
    if (!p.isOnWall) { p.ySpd += grav; }
    
    if (p.xSpd > 0) { p.sr = 0; }
    else if (p.xSpd < 0) { p.sr = 1; }

    
    // LIMIT SPEED
    p.xSpd = clamp(p.xSpd,-p.maxSpd,p.maxSpd);
    p.ySpd = clamp(p.ySpd,-4000,4000);
    
    // Horizontal collision
    if (touching(p.x + (p.xSpd/1000), p.y, "x")) {
        while (!touching(p.x+Math.sign(p.xSpd), p.y, "x")) { p.x += Math.sign(p.xSpd); }
        
        // Wall grab
        if (touching(p.x+Math.sign(p.xSpd), p.y, "x")) {
            if ((BTN[8] && BTN[7]) || BTN[7]) {
                p.ySpd = p.jumpSpd;
                // p.xSpd = 8 * (Math.sign(p.xSpd) * -1);
            } else if (BTN[8] && !BTN[7]) {
                p.ySpd = 0;
            } else { p.ySpd = 0.1; }
        }

        p.xSpd = 0;
    }
    p.x += Math.floor(p.xSpd / 1000);
    
    // Vertical collision
    if (touching(p.x, p.y + (p.ySpd/1000), "y")) {
        while (!touching(p.x, p.y + Math.sign(p.ySpd), "y")) { p.y += Math.sign(p.ySpd); }
        if (Math.sign(p.ySpd) == 1) { p.canJump = true; }
        p.ySpd = 0;
    } else { p.canJump = false; }
    p.y += (p.ySpd / 1000);

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

    
    /* -------------------------------------------------------------------------- */
    /*                                   CAMERA                                   */
    /* -------------------------------------------------------------------------- */

    camera(p);

    /* -------------------------------------------------------------------------- */
    /*                                  ANIMATION                                 */
    /* -------------------------------------------------------------------------- */

    // Set rotation
    if (p.xSpd > 0) { p.sr = 0; }
    else if (p.xSpd < 0) { p.sr = 1; }


    if (p.xSpd == 0) {
        // Idle
        p.si = 0;
    } else if (p.xSpd != 0) {
        if (p.si == 0 && p.st == 0) {
            // Start run
            p.si = 1;
        }

        p.st++;

        if (p.st == 6) {
            p.st = 0;
            // Continue run
            p.si++;
            if (p.si == 5) {
                p.si = 1
            }
        }
    }
    if (p.ySpd != 0) {
        // Jumping & falling
        if (p.ySpd < 0) {
            p.si = 3;
        } else if (p.ySpd > 0) {
            p.si = 4;
        }
    }

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

    function jump() {
        p.ySpd = p.jumpSpd;
    }

    function camera(obj) {
        /* 
        * Camera follows object and centers in on it
        */

        cam.fxPos = obj.x - 156;
        cam.fyPos = obj.y - 86;
        cam.x = lerp(cam.x, cam.fxPos, 0.1);
        cam.y = lerp(cam.y, cam.fyPos, 0.1);

        cam.x = clamp(cam.x, 0, (LAYER[0].gridCellsX * 8) - 320);
        cam.y = clamp(cam.y, 0, (LAYER[0].gridCellsY * 8) - 180);
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

    ctxEntity.drawImage(p.img,8 * p.si,8 * p.sr,8,8,p.x - cam.x,Math.floor(p.y) - cam.y,8,8);

    let img = document.getElementById("lvl1");
    ctxScreen.drawImage(img,cam.x,cam.y,320,180,0,0,320,180);
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
    
    let l = LAYER[0];

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
    let winW = Math.floor(window.innerHeight / 180);
    let winH = Math.floor(window.innerWidth / 320);
    let SCALE = Math.min(winW,winH);
    
    const layer = document.querySelectorAll('.game-layers');
    
    layer.forEach(l => {
        l.style.width = `${SCALE * 320}px`;
        l.style.height = `${SCALE * 180}px`;
    });

    // !Changing a bit to make default be full screen
    /* let winW = window.innerHeight;
    let winH = window.innerWidth;

    console.log(winW, winH);
    
    if (winW > winH) { winW = winW * (9/16); }
    else { winH = winH * (16/9); }

    console.log(winW, winH);
    
    const layer = document.querySelectorAll('.game-layers');
    
    layer.forEach(l => {
        l.style.width = `${winW}px`;
        l.style.height = `${winH}px`;
    }); */
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

function lerp(a,b,t) {
    return a + (b - a) * t;
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}


window.onload = startTimer();