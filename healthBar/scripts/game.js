// Canvas Variables
const cUI = document.getElementById("ui-layer");
const ctxUI = cUI.getContext("2d");
const width = cUI.width = 1280;
const height = cUI.height = 720;

// Health Bar Variables
let maxHealth = 100;
let health = 100;
const healthBarWidth = 192;
const healthBarHeight = 19;
const x = 199;
const y = 26;

const healthBar = new HealthBar(x, y, healthBarWidth, healthBarHeight, maxHealth, health,  "green");

// Updates frames
const frame = function() {
  ctxUI.clearRect(0, 0, width, height);
  let baseLayer = new Image();
  baseLayer.src = 'images/baseLayer.png';
  ctxUI.drawImage(baseLayer, 180, 16, 225, 45);
  healthBar.show(ctxUI);
  let border = new Image();
  border.src = 'images/border.png';
  ctxUI.drawImage(border, 180, 16, 225, 45);
  let heart = new Image();
  heart.src = 'images/heart.png';
  ctxUI.drawImage(heart, 180, 16, 225, 45);
  requestAnimationFrame(frame);
}

frame();

//  ** Change to a on damage function **
cUI.onclick = function() {
  health -= 8;
  healthBar.updateHealth(health);
  if(health <= 75){
    healthBar.updateColor(health);
  }
};
