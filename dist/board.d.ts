import { Coords } from "./types";
declare type BoardState = {
    cells: Cell[];
};
declare type BoardMatrix = (Cell | null)[][];
export declare class Board {
    private readonly boardSize;
    private state;
    private ee;
    private static UPDATE_EVENT;
    constructor(boardSize: number);
    onUpdate(handler: (state: BoardState, prevState: BoardState) => void): void;
    restore(cells: Cell[]): void;
    reset(): void;
    move(axis: keyof Coords, step: -1 | 1): boolean;
    private setState;
    getBoardMatrix(): BoardMatrix;
    spawnCells(count: number): void;
}
export declare class Cell {
    readonly value: number;
    readonly key: string;
    readonly x: number;
    readonly y: number;
    constructor(coords: Coords, value: number);
    doubleValue(): void;
    setCoords(coords: Coords): void;
    get coords(): Coords;
    private validateValue;
}
export {};
