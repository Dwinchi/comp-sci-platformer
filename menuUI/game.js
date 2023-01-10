const cUI = document.getElementById('ui-layer');
const ctxUI = cUI.getContext("2d");
let pause = false;

// Menu Variables
const menuWidth = 80;
const menuHeight = 90;
const optionIndent = 14;
let menuOptions = 1;

// Current Player Variables
let currentPlayer = true;

// Input
document.onkeydown = checkKeycode;
document.onkeyup = checkKeycodeUp;

let Keys = {
	up: false,
	down: false,
    enter: false
}

function checkKeycode(e) {
    let keycode = e.keyCode;
    e.preventDefault();

    if (keycode == 38 || keycode == 87) {
        Keys.up = true; // Up
    }
    if (keycode == 40 || keycode == 83) {
        Keys.down = true; // Down
    }
    if (keycode == 13) {
        Keys.enter = false; // enter
    }

    move();
}

function checkKeycodeUp(e) {
    let keycode = e.keyCode;
    e.preventDefault();

    if (keycode == 38 || keycode == 87) {
        Keys.up = false; // Up
    }
    if (keycode == 40 || keycode == 83) {
        Keys.down = false; // Space
    }
    if (keycode == 13) {
        Keys.enter = false; // enter
    }
    
    move();
}

function move(){
    if(menuOptions <= 3 && menuOptions > 1){
        if(Keys.up == true){
            menuOptions -= 1;
        }
    }
    if(menuOptions >= 1 && menuOptions < 3){
        if(Keys.down == true){
            menuOptions++;
        }
    }
}

function pauseGame(){
    pause = true;
}

const frame = function() {
    ctxUI.imageSmoothingEnabled = false;
    ctxUI.clearRect(0, 0, cUI.width, cUI.height);

    if(pause == true){
        const menu = new menuScreen((cUI.width/2 - menuWidth/2), (cUI.height/2 - menuHeight/2), menuWidth, menuHeight, 2);
        menu.show(ctxUI);
        let titleImg = new Image();
        titleImg.src = "images/title.png";
        titleImg.width = 80;
        titleImg.height = 80;
        ctxUI.drawImage(titleImg, (cUI.width/2 - titleImg.width/2), (cUI.height/2 - (titleImg.height - 10)), 80, 80);
        let resume = new Image();
        resume.src = "images/resume.png";
        ctxUI.drawImage(resume, (cUI.width/2 - resume.width/2), (cUI.height/2 - resume.height/2), 26, 25);
        let settings = new Image();
        settings.src = "images/settings.png";
        ctxUI.drawImage(settings, (cUI.width/2 - settings.width/2), (cUI.height/2 - settings.height/2) + optionIndent, 33, 25);
        let exit = new Image();
        exit.src = "images/exit.png";
        ctxUI.drawImage(exit, (cUI.width/2 - exit.width/2), (cUI.height/2 - exit.height/2) + optionIndent*2, 25, 25);
        switch (menuOptions){
            case 1: 
                highl = new highlighted(cUI.width/2 - (resume.width/2)*2, cUI.height/2 - (resume.height/2) + 12, 5, 1, 47);
                break;
            case 2: 
                highl = new highlighted(cUI.width/2 - (settings.width/2)*2 + 4, cUI.height/2 - (resume.height/2) + 12 + optionIndent, 5, 1, 52);
                break;
            case 3: 
                highl = new highlighted(cUI.width/2 - (20/2)*2, cUI.height/2 - (resume.height/2) + 12 + optionIndent*2, 5, 1, 34);
                break;
        }
        highl.show(ctxUI);
    }

    requestAnimationFrame(frame);

}

frame();
