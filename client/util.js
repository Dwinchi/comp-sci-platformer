export function lerp(a, b, t) {
    return a + (b - a) * t;
}
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
