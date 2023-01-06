import { GC } from "./Game.js";

let TS = {
    x: 11,
    y: 5,
    tiles: [1,2,3,4]
};

export function Lerp(a,b,t) {
    return a + (b - a) * t;
}

export function Clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function Touching(obj, x, y, dir) {
    x = Math.floor(x);
    y = Math.floor(y);

    let x1;
    let x2;
    let y1;
    let y2;
    let t0;
    let t1;
    let t2;
    let t3;
    
    let l = GC.level;

    if (dir == "x") {
        x1 = Math.floor(x / 8);
        x2 = Math.floor((x + obj.w) / 8);
        y1 = Math.floor(y / 8);
        y2 = Math.floor((y + obj.h) / 8);
    } else if (dir == "y") {
        x1 = Math.floor(x / 8);
        x2 = Math.floor((x + obj.w) / 8);
        y1 = Math.floor(y / 8);
        y2 = Math.floor((y + obj.h) / 8);
    }

    t0 = l.data[x1 + (y1 * (l.width / 8))];
    t1 = l.data[x2 + (y1 * (l.width / 8))];
    t2 = l.data[x1 + (y2 * (l.width / 8))];
    t3 = l.data[x2 + (y2 * (l.width / 8))];

    // Vertical
    if (t1 == 1 || t0 == 1) {
        return 1;
    } else if (t2 == 1 || t3 == 1) {
        return 1;
    }
    
    // Horizontal
    if (t1 == 1 || t3 == 1) {
        return 1;
    } else if (t0 == 1 || t2 == 1) {
        return 1;
    }

    return 0;
}