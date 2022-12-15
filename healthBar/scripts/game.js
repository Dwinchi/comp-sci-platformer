// Canvas Variables
const cUI = document.getElementById("ui-layer");
const ctxUI = cUI.getContext("2d");
const width = cUI.width = 980;
const height = cUI.height = 540;

// Health Bar Variables
let maxHealth = 100;
let health = 100;
const healthBarWidth = 65;
const healthBarHeight = 7;
const x = 50;
const y = 8;

const healthBar = new HealthBar(x, y, healthBarWidth, healthBarHeight, maxHealth, health,  "green");

// Updates frames
const frame = function() {
  ctxUI.clearRect(0, 0, width, height);
  let baseLayer = new Image();
  baseLayer.src = 'images/baseLayer.png';
  ctxUI.drawImage(baseLayer, 45, 4, 75, 15);
  healthBar.show(ctxUI);
  let border = new Image();
  border.src = 'images/border.png';
  ctxUI.drawImage(border, 45, 4, 75, 15);
  let heart = new Image();
  heart.src = 'images/heart.png';
  ctxUI.drawImage(heart, 45, 4, 75, 15);
  requestAnimationFrame(frame);
}

//  ** Change to a on damage function **
cUI.onclick = function() {
  health -= 8;
  healthBar.updateHealth(health);
  if(health <= 75){
    healthBar.updateColor(health);
  }
};

frame();