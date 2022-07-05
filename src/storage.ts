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
    public static save(state: Partial<GamePersisted>) {
        const loaded = this.loadJson()!;

        localStorage.setItem(
            this.LS_KEY,
            JSON.stringify({
                ...loaded,
                boardSize: state.boardSize,
                cells: state.cells?.map(({ x, y, value }) => ({ x, y, value })),
            })
        );
    }
    public static load(): Partial<GamePersisted> | null {
        const parsed = this.loadJson();

        if (!parsed) {
            return null;
        }

        return {
            boardSize: parsed.boardSize,
            cells: parsed.cells?.map(({ x, y, value }) => new Cell({ x, y }, value)),
        };
    }

    private static loadJson(): Partial<GamePersistedJson> | null {
        try {
            return JSON.parse(localStorage.getItem(this.LS_KEY)!);
        } catch {
            return null;
        }
    }
}
