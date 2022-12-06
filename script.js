console.clear();
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
let BTN = [0,0,0,0,0,0,0];
let AXIS = [0,0];
let TIMER;

var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

function tick() {
    var time = Date.now();
    frame++;
    if (time - startTime > 1000) {
        fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
        startTime = time;
        frame = 0;
	}
}

let p = {
    x:0,
    y:0,
    img:img = document.getElementById("player-img"),
    sprite:0,
    accel:0.5,
    deccel:0.25,
    maxSpd:2,
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
    
    // Player movement
    // Set sprint
    if (BTN[4]) {
        p.maxSpd = 4;
        p.deccel = .5;
    } else if (!BTN[4]) {
        p.maxSpd = 2;
        p.deccel = .25;
    }

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

    p.x += p.xSpd;
    p.y += p.ySpd;

    draw();
}

function draw() {
    ctxEntity.clearRect(0, 0, cEntity.width, cEntity.height);
    ctxEntity.drawImage(p.img,Math.floor(p.x),Math.floor(p.y));

}

function changeKey(key, state) {
    let k = key.toLowerCase();

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

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

window.onload = startTimer();