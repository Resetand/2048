import { Coords } from "./types";
export declare const randomize: (min: number, max: number, cfg?: {
    exclude: number[];
} | undefined) => number;
export declare const isPowerOfTwo: (value: number) => boolean;
declare type RangeGenerator = {
    (from: number): Generator<number>;
    (from: number, to: number, step?: number): Generator<number>;
};
export declare const range: RangeGenerator;
/**
 * Генерирует короткий ID
 */
export declare const generateId: () => string;
export declare const insertChildAtIndex: (parent: HTMLElement, child: ChildNode, index: number) => void;
export declare const calcCoordsByIndex: (index: number, boardSize: number) => Coords;
export declare const calcIndexByCoords: (coords: Coords, boardSize: number) => number;
export declare function matrixIterator<T extends unknown>(matrix: T[][], pivotAxis?: "x" | "y", reversed?: boolean): Generator<{
    value: T;
    x: number;
    y: number;
    index: number;
}, void, unknown>;
export declare const isObject: (value: unknown) => value is Record<string, unknown>;
export declare const deepEqual: (a: unknown, b: unknown) => boolean;
export {};
