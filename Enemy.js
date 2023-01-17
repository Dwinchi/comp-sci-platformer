import { Clamp, Touching } from './Util.js';
import { Physics, Cam, GC, BTN, AXIS, Transition } from "./Game.js";

export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 7;
        this.h = 7;
        this.xSpd = 0;
        this.ySpd = 0;
        this.img = document.getElementById("enemy-img");
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
        
    }


    update() {

    
        /* -------------------------------------------------------------------------- */
        /*                               ENEMY MOVEMENT                               */
        /* -------------------------------------------------------------------------- */
        this.isOnGround = Touching(this, this.x, this.y + 1, "x");


        // Normal gravity
        { this.ySpd += Physics.grav; }
        
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
        /*                                   ATTACKS                                  */
        /* -------------------------------------------------------------------------- */
        
    }
}