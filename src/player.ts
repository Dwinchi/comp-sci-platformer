import { clamp } from './util';

enum State {
    IDLE,
    RUN,
    JUMP,
    FALL,
    WALLJUMP,
    WALLSLIDE,
}

class Player {
    current_state: State = State.IDLE;

    base_accel: number = 100
    max_speed: number = 500;
    gravity: number = 1000;
    jump_force: number = -500;

    accel: number = this.base_accel;
    deccel: number = this.accel * 2;

    dx: number = 0;
    dy: number = 0;
    x_axis: number = 0;
    direction: boolean = true;
    
    change_state(new_state: State, dt: number) {
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

    run(dt: number) {
        this.dx += this.x_axis * this.accel * dt;
        this.dx = clamp(this.dx, -this.max_speed, this.max_speed);
    }

    fall(dt: number) {
	    this.dy += this.gravity * dt
    }
}

class BaseState {
    parent: Player;

    constructor(parent: Player) {
        this.parent = parent
    }

    enter() {}
    update(dt: number) {}
    draw() {}
}

class IdleState extends BaseState {
    constructor(parent: Player) {
        super(parent);
    }

    update(dt: number) {
        if (this.parent.x_axis !== 0) {
            this.parent.change_state(State.RUN, dt);
        }
    }

    draw() {}
}