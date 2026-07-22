import { clamp } from './util';
var State;
(function (State) {
    State[State["IDLE"] = 0] = "IDLE";
    State[State["RUN"] = 1] = "RUN";
    State[State["JUMP"] = 2] = "JUMP";
    State[State["FALL"] = 3] = "FALL";
    State[State["WALLJUMP"] = 4] = "WALLJUMP";
    State[State["WALLSLIDE"] = 5] = "WALLSLIDE";
})(State || (State = {}));
class Player {
    current_state = State.IDLE;
    base_accel = 100;
    max_speed = 500;
    gravity = 1000;
    jump_force = -500;
    accel = this.base_accel;
    deccel = this.accel * 2;
    dx = 0;
    dy = 0;
    x_axis = 0;
    direction = true;
    change_state(new_state, dt) {
        // Change the player's state
        this.current_state = new_state;
        switch (this.current_state) {
            case State.IDLE:
                // Handle idle state
                break;
            case State.RUN:
                // Handle run state
                break;
            case State.JUMP:
                // Handle jump state
                break;
            case State.FALL:
                // Handle fall state
                break;
            case State.WALLJUMP:
                // Handle wall jump state
                break;
            case State.WALLSLIDE:
                // Handle wall slide state
                break;
        }
    }
    update() {
        // Update the player's state
    }
    run(dt) {
        this.dx += this.x_axis * this.accel * dt;
        this.dx = clamp(this.dx, -this.max_speed, this.max_speed);
    }
    fall(dt) {
        this.dy += this.gravity * dt;
    }
}
class BaseState {
    parent;
    constructor(parent) {
        this.parent = parent;
    }
    enter() { }
    update(dt) { }
    draw() { }
}
class IdleState extends BaseState {
    constructor(parent) {
        super(parent);
    }
    update(dt) {
        if (this.parent.x_axis !== 0) {
            this.parent.change_state(State.RUN, dt);
        }
    }
    draw() { }
}
