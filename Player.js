import { Clamp, Touching } from './Util.js';
import { Physics, Cam } from "./Game.js";

export class Player {
    constructor(x, y , w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xSpd = 0;
        this.ySpd = 0;
        this.img = document.getElementById("player-img");
        // animation
        this.st = 1;
        this.s = 0;
        this.si = 0;
        this.sr = 0;
        this.st = 0;
        // states
        this.canJump = false,
        this.isOnWall = false;
        this.isOnGround = false;
        //timer
        this.wallJumpDelay = 0;
        //powers
        this.arrows = [0,0,0];
        this.canFire = false;
        this.power = false;
        this.BTN = [0,0,0,0,0,0,0,0];
        this.AXIS = [0,0];
    }

    update() {
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
                if ((Math.sign(this.xSpd) == 1 && Math.sign(this.xSpd - (Physics.deccel * Math.sign(this.xSpd))) == -1)
                || (Math.sign(this.xSpd) == -1 && Math.sign(this.xSpd - (Physics.deccel * Math.sign(this.xSpd))) == 1)
                ) {
                    this.xSpd = 0;
                }
                this.xSpd -= (Physics.deccel * Math.sign(this.xSpd));
                if (!this.xSpd) { this.x =  Math.floor(this.x); }
            }
            this.xSpd = Clamp(this.xSpd,-Physics.maxSpd,Physics.maxSpd);
        }
    
        this.isOnWall = Touching(this, this.x + (1 * Math.sign(this.xSpd)), this.y, "x");
        
        // Wall jump
        if (this.isOnWall && !this.isOnGround && this.BTN[7]) {
            this.wallJumpDelay = 3;
            this.xSpd = -Math.sign(this.xSpd) * Physics.maxSpd;
            this.isOnWall = 0;
            this.ySpd = Physics.jumpSpd;
            this.BTN[7] = 0;
        }
        // Jump
        if (this.BTN[7] && this.isOnGround) {
            this.ySpd = Physics.jumpSpd;
            this.BTN[7] = 0;
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
        this.x += Math.floor(this.xSpd / 1000);
        
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
    }

    draw(ctx) {
        ctx.drawImage(this.img,8 * this.si,8 * this.sr,8,8,this.x - Cam.x,Math.floor(this.y) - Cam.y,8,8);
    }
}