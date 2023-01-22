/* import { Clamp, Touching } from './Util.js';
import { Physics, GC, BTN, AXIS } from "./Game.js";
import { Camera } from './Game.js';

export class Player {
    constructor(x, y, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.w = 7;
        this.h = 7;
        this.xSpd = 0;
        this.ySpd = 0;
        console.log(this.id);
        this.img = document.getElementById(`p${GC.id}`);
        this.BTN;
        this.AXIS;
        // animation
        this.s = 0;
        this.si = 0;
        this.sr = 0;
        this.st = 0;
        // states
        this.canJump = false,
        this.isOnWall = false;
        this.isOnGround = false;
        // timer
        this.wallJumpDelay = 0;
        // powers
        this.arrows = [0,0,0];
        this.canFire = false;
        this.power = false;

        if (GC.id == this.id) {
            GC.cam = new Camera(this);
        }
        
        GC.obj.pl.push(this);
    }

    update() {
        if (GC.id == this.id) {
            this.BTN = BTN;
            this.AXIS = AXIS;
        }

        /* -------------------------------------------------------------------------- */
        /*                                  Settings                                  */
        /* -------------------------------------------------------------------------- */
        if (this.BTN[4]>0) {
            Transition(20,50);
            this.BTN[4] = -1;
        }

        /* -------------------------------------------------------------------------- */
        /*                               Player movement                              */
        /* -------------------------------------------------------------------------- */
        this.isOnGround = Touching(this, this.x, this.y + 1, "x");
        this.wallJumpDelay = Math.max(this.wallJumpDelay-1,0);
        
        if (!this.wallJumpDelay) {
            // Accelerate
            if (this.AXIS[1]) { this.xSpd += (Physics.accel*this.AXIS[1]); }
            
            // Deccelerate
            if (!this.AXIS[1]) {
                if ((this.xSpd > 0 && this.xSpd - (Physics.deccel * Math.sign(this.xSpd)) < 0) ||
                (this.xSpd < 0 && this.xSpd - (Physics.deccel * Math.sign(this.xSpd)) > 0)) {
                    this.xSpd = 0;
                }
                this.xSpd -= (Physics.deccel * Math.sign(this.xSpd));
                if (!this.xSpd) { this.x =  Math.floor(this.x); }
            }
            this.xSpd = Clamp(this.xSpd,-Physics.maxSpd,Physics.maxSpd);
        }
    
        this.isOnWall = Touching(this, this.x + (1 * Math.sign(this.xSpd)), this.y, "x");
        
        // Wall jump
        if (this.isOnWall && !this.isOnGround && this.BTN[5]>0) {
            this.wallJumpDelay = 3;
            this.isOnWall = 0;
            this.xSpd = -Math.sign(this.xSpd) * Physics.maxSpd;
            this.ySpd = Physics.jumpSpd;
            this.BTN[5] = -1;
        }
        // Jump
        if (this.BTN[5]>0 && this.isOnGround) {
            this.ySpd = Physics.jumpSpd;
            this.BTN[5] = -1;
        }
        
        if (this.isOnWall) { this.xSpd = 0; }
    
        // Wall slide
        if (this.isOnWall && this.ySpd > 0) { this.ySpd = Physics.grav/2; }
        // Normal gravity
        else { this.ySpd += Physics.grav; }
    
        this.ySpd = Clamp(this.ySpd,-4000,4000);
        
        // Horizontal collision
        if (Touching(this, this.x + (this.xSpd/1000), this.y, "x")) {
            while (!Touching(this, this.x + Math.sign(this.xSpd), this.y, "x")) { this.x += Math.sign(this.xSpd); }
            this.xSpd = 0;
        }
        this.x += Math.floor(Math.abs(this.xSpd) / 1000) * Math.sign(this.xSpd);
        
        // Vertical collision
        if (Touching(this, this.x, this.y + (this.ySpd/1000), "y")) {
            while (!Touching(this, this.x, this.y + Math.sign(this.ySpd), "y")) { this.y += Math.sign(this.ySpd); }
            this.ySpd = 0;
        }
        this.y += (this.ySpd / 1000);

        /* -------------------------------------------------------------------------- */
        /*                                  ANIMATION                                 */
        /* -------------------------------------------------------------------------- */

        // Set rotation
        if (this.xSpd > 0) { this.sr = 0; }
        else if (this.xSpd < 0) { this.sr = 1; }

        // Idle
        if (this.isOnGround && !this.xSpd) { this.si = 0; }
        // Run
        if (this.xSpd) {
            if (this.si == 0 && this.st == 0) { this.si = 1; }
            this.st++;

            if (this.st == 6) {
                this.st = 0;
                // Continue animation
                this.si++;
                if (this.si >= 5) {
                    this.si = 1;
                }
            }
        }
        if (!this.isOnGround) {
            // Jumping & falling
            if (this.ySpd < 0) { this.si = 3; }
            if (this.ySpd > 0) { this.si = 4; }
            
        }


        if (this.isOnWall && !this.isOnGround) { this.si = 5; }
    
    /* -------------------------------------------------------------------------- */
    /*                                   POWERS                                   */
    /* -------------------------------------------------------------------------- */
    // If player has bow
    /* if (this.power == 1) {
        this.canFire = true;
    }
    
        /* -------------------------------------------------------------------------- */
        /*                                   POWERS                                   */
        /* -------------------------------------------------------------------------- */
        // If player has bow
        /* if (this.power == 1) {
            this.canFire = true;
        }
        
        // If player has bow
        if (bowPwr) {
            canFire = true;
        }

        // Firing bow 
        if (this.canFire) {
            movearrows()
        } */

        /* function movearrows() {
            for (let arrow of this.arrows) {
                // Shoot arrow
                if (!arrow && BTN[6]) {
                    this.arrows[this.arrows.indexOf(arrow)] = {
                        x: this.w,
                        y: this.h,
                        dir: this.dir
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
                    let b = document.getElementById(`shot${this.arrows.indexOf(arrow)}`).style;
                    b.left = `${x}px`;
                    b.top = `${y}px`;
                    
                    arrow.x = x;
                    arrow.y = y;
                    
                    // Checking if arrow is out of the screen
                    if (arrow.x > window.innerWidth || arrow.y > window.innerHeight || arrow.x < 0 || arrow.y < 0) {
                        this.arrows[this.arrows.indexOf(arrow)] = 0;
                        b.left = `${-50}px`;
                        b.top = `${-50}px`;
                    }
            
                    if ((this.x < arrow.x + 50) && (this.x + 50 < arrow.x) && (this.y < arrow.y + 50) && (this.y + 50 > arrow.y)) {}
            
                    // Checking if arrow hits opponent and removing it
                    
                
                }
            }
        } */
  /*   }

    draw(ctx) {
        ctx.drawImage(this.img,8 * this.si,8 * this.sr,8,8,this.x - GC.cam.x,Math.floor(this.y) - GC.cam.y,8,8);
    }
} */