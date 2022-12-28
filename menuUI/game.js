const cUI = document.getElementById('ui-layer');
const ctxUI = cUI.getContext("2d");
let pause = true;

// Menu Variables
const menuWidth = 225;
const menuHeight = 125;

// Current Player Variables
let currentPlayer = true;

const menu = new menuScreen((cUI.width/2 - menuWidth/2), (cUI.height/2 - menuHeight/2), menuWidth, menuHeight, 2);

const frame = function() {
    resize();
    ctxUI.clearRect(0, 0, cUI.width, cUI.height);
    menu.show(ctxUI);
    let titleImg = new Image();
    titleImg.src = "images/title.png";
    ctxUI.drawImage(titleImg, (cUI.width/2 - 100/2), (cUI.height/2 - 100), 100, 100);
    let exitText = new Image();
    exitText.src = "images/exit.png";
    ctxUI.drawImage(exitText, cUI.width/2/2, (cUI.height/2 + 20/2), 20, 20);
    requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);

frame();

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