console.clear();

import * as level from "./levels/1-1/1-1.json" assert { type: "json" };
import { Lerp, Clamp } from './Util.js';
import { Player } from "./Player.js";
let LAYERS = level.default.layers;

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

// Short for Game Controller
let GC = {
    state: 0,
    music: "",
    level: 0,
    gameMode: 0,
}

GC.level = "1-1";


export let Physics = {
    grav: 200,
    accel: 200,
    deccel: 400,
    maxSpd: 2000,
    jumpSpd: -3000,
}

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

let BTN = [0,0,0,0,0,0,0,0];
let AXIS = [0,0];

const cUI = document.getElementById("ui-layer");
const cEntity = document.getElementById("entity-layer");
const cScreen = document.getElementById("screen-layer");

let ctxUI = cUI.getContext("2d");
let ctxEntity = cEntity.getContext("2d");
let ctxScreen = cScreen.getContext("2d");

const p = new Player(10,10,7,7);

function startTimer() {
    resize();
    TIMER = setInterval(update, (1000/60));
}

function update() {
    tick();

    p.BTN = BTN;
    p.AXIS = AXIS;

    p.update()
    
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

    Camera(p);

    draw();

    function Camera(obj) { 
        //* Camera follows object
        Cam.img = document.getElementById("l1-1")

        if (LAYERS[1].gridCellsX > 40) {
            Cam.fxPos = obj.x - 156;
            Cam.x = Lerp(Cam.x, Cam.fxPos, 0.1);
            Cam.x = Clamp(Cam.x, 0, (LAYERS[1].gridCellsX * 8) - 320);
        }
        if (LAYERS[1].gridCellsY > 23) {
            Cam.fyPos = obj.y - 86;
            Cam.y = Lerp(Cam.y, Cam.fyPos, 0.1);
            Cam.y = Clamp(Cam.y, 0, (LAYERS[1].gridCellsY * 8) - 180);
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

    p.draw(ctxEntity);

    ctxScreen.drawImage(Cam.img,Cam.x,Cam.y,320,180,0,0,320,180);
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

function resize() {
    let winW = Math.floor(window.innerHeight / 180);
    let winH = Math.floor(window.innerWidth / 320);
    let SCALE = Math.min(winW,winH);
    
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

window.onload = startTimer();