class HealthBar {
    constructor(x, y, w, h, maxHealth, health, color) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.maxHealth = maxHealth;
      this.maxWidth = w;
      this.health = maxHealth;
      this.color = color;
    }
  
    show(context) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.w, this.h);
    }
  
    updateHealth(val) {
      if (val >= 0) {
        this.health = val;
        this.w = (this.health / this.maxHealth) * this.maxWidth;
      }
    }

    updateColor(health) {
      if (health <= 75 && health > 50) {
        this.color = "#e8c64a";
      }
      if(health <= 50 && health > 25){
        this.color = "#e66617"
      }
      if(health <= 25){
        this.color = "#c20000"
      }
    }
  }