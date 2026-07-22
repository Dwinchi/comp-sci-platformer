export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}