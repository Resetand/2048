import { Coords } from "./types";

export const randomize = (min: number, max: number, cfg?: { exclude: number[] }): number => {
    const value = Math.floor(Math.random() * (max - min + 1) + min);
    if (!cfg?.exclude.includes(value)) {
        return value;
    }
    return randomize(min, max, cfg);
};

export const isPowerOfTwo = (value: number) => {
    return (Math.log(value) / Math.log(2)) % 1 === 0;
};

type RangeGenerator = {
    (from: number): Generator<number>;
    (from: number, to: number, step?: number): Generator<number>;
};

export const range: RangeGenerator = function* (fromOrTo: number, to?: number, step: number = 1) {
    let start = to !== undefined ? fromOrTo : 0;
    let end = to !== undefined ? to : fromOrTo;
    const reversed = Math.sign(step) < 0;

    if (reversed) {
        [start, end] = [end - 1, start - 1];
    }

    for (let i = start; reversed ? i > end : i < end; i += step) {
        yield i;
    }
};

/**
 * Генерирует короткий ID
 */
export const generateId = () => "_" + Math.random().toString(36).slice(2, 9);

export const insertChildAtIndex = (parent: HTMLElement, child: ChildNode, index: number) => {
    if (!index) index = 0;
    if (index >= parent.children.length) {
        parent.appendChild(child);
    } else {
        parent.insertBefore(child, parent.children[index]);
    }
};

export const calcCoordsByIndex = (index: number, boardSize: number): Coords => {
    const x = index % boardSize;
    const y = Math.floor(index / boardSize);
    return { x, y };
};

export const calcIndexByCoords = (coords: Coords, boardSize: number): number => {
    return coords.x + coords.y * boardSize;
};

export function* matrixIterator<T extends unknown>(matrix: T[][], pivotAxis: "x" | "y" = "x", reversed?: boolean) {
    const size = matrix.length;

    for (const a1 of range(size)) {
        for (const a2 of range(0, size, reversed ? -1 : 1)) {
            const [x, y] = pivotAxis === "x" ? [a2, a1] : [a1, a2];

            const value = matrix[y][x];
            const index = calcIndexByCoords({ x, y }, size);

            yield { value, x, y, index };
        }
    }
}

export const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value != null;

export const deepEqual = (a: unknown, b: unknown): boolean => {
    // P1
    if (typeof a !== typeof b) {
        return false;
    }

    if (Object.is(a, b)) {
        return true;
    }

    // P2
    if (!isObject(a) || !isObject(b)) {
        return false;
    }

    // P3
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    return keysA.every((key) => deepEqual(a[key], b[key]));
};
