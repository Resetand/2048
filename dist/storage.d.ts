import { Cell } from "./board";
interface GamePersisted {
    cells: Cell[];
    boardSize: number;
}
export declare class Storage {
    private static LS_KEY;
    static save(state: Partial<GamePersisted>): void;
    static load(): Partial<GamePersisted> | null;
    private static loadJson;
}
export {};
