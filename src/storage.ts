import { Cell } from "./board";

interface GamePersisted {
    cells: Cell[];
    boardSize: number;
}

interface GamePersistedJson {
    cells: { value: number; x: number; y: number }[];
    boardSize: number;
}

export class Storage {
    private static LS_KEY = "game-state";
    public static save(state: GamePersisted) {
        const json: GamePersistedJson = {
            boardSize: state.boardSize,
            cells: state.cells.map(({ x, y, value }) => ({ x, y, value })),
        };
        localStorage.setItem(this.LS_KEY, JSON.stringify(json));
    }
    public static load(): GamePersisted | null {
        try {
            const parsed = JSON.parse(localStorage.getItem(this.LS_KEY)!) as GamePersistedJson;
            return {
                boardSize: parsed.boardSize,
                cells: parsed.cells.map(({ x, y, value }) => new Cell({ x, y }, value)),
            };
        } catch {
            return null;
        }
    }
}
