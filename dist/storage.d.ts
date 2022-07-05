import { Cell } from "./board";
interface GamePersisted {
    cells: Cell[];
    boardSize: number;
}
export declare class Storage {
    private static LS_KEY;
    static save(state: GamePersisted): void;
    static load(): GamePersisted | null;
}
export {};
