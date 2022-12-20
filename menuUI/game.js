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
    ctxUI.clearRect(0, 0, cUI.width, cUI.height);
    menu.show(ctxUI);
    let titleImg = new Image();
    titleImg.src = "images/title.png"; 
    ctxUI.drawImage(titleImg, (cUI.width/2 - 100/2), (cUI.height/2 - 100), 100, 100);
    requestAnimationFrame(frame);
}

frame();
