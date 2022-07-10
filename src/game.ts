import { Board, Cell } from "./board";
import { Command, Controller } from "./controller";
import { Storage } from "./storage";
import { Renderer } from "./renderer";
import { Coords } from "./types";
import { sleep } from "./utils";

type GameConfig = {
    boardElement: HTMLElement;
    scoreValueElement: HTMLElement;
    boardSize: number;
};

type GameState = {
    score: number;
    cells: Cell[];
    boardSize: number;
    afterPartyMode: boolean;
};

export class Game {
    private storage = new Storage<GameState>("game-state.v1", {
        cells: [
            (cells) => cells?.map(({ x, y, value }) => ({ x, y, value })),
            (parsed) => parsed?.map(({ x, y, value }: any) => new Cell({ x, y }, value)),
        ],
    });

    private _state?: Partial<GameState>;

    constructor(private cfg: GameConfig) {}

    private get state(): GameState {
        const persisted = this.storage.load();

        const DEFAULT_STATE: GameState = {
            boardSize: this.cfg.boardSize,
            cells: [],
            score: 0,
            afterPartyMode: false,
        };

        if (this._state) {
            return { ...DEFAULT_STATE, ...this._state };
        }

        if (persisted) {
            return persisted;
        }

        return DEFAULT_STATE;
    }

    private setState(patch: Partial<GameState>) {
        const newState = { ...this.state, ...patch };
        this.storage.save(newState);
        this._state = newState;
    }

    bootstrap() {
        const resetButton = document.getElementById("reset-button")!;
        const currentScoreValue = document.getElementById("current-score-value")!;

        const controller = new Controller(this.cfg.boardElement);
        const renderer = new Renderer(this.cfg.boardElement, this.state.boardSize);
        const board = new Board(this.state.boardSize);

        const moveHandler = {
            [Command.UP]: () => board.move("y", -1),
            [Command.DOWN]: () => board.move("y", 1),
            [Command.LEFT]: () => board.move("x", -1),
            [Command.RIGHT]: () => board.move("x", 1),
        };

        const reset = () => {
            this.setState({ cells: [], score: 0, afterPartyMode: false });
            board.reset();
            board.spawnCells(2);
            currentScoreValue.innerHTML = String(this.state.score);
        };

        board.onCellsMerge((cell) => {
            const currentScore = this.state.score + cell.value;
            this.setState({ score: currentScore });
            currentScoreValue.innerHTML = String(currentScore);
        });

        board.onUpdate(({ cells }) => {
            renderer.render(cells);

            if (this.isGameOver(cells)) {
                return locked(() =>
                    sleep(300).then(() => {
                        alert("Game Over!");
                        reset();
                    })
                );
            }

            if (this.isWin(cells) && !this.state.afterPartyMode) {
                return locked(() =>
                    sleep(300).then(() => {
                        const afterPartyMode = confirm("You just reached the 2048 🎉🎉🎉. Do you want to continue?");
                        if (afterPartyMode) {
                            this.setState({ afterPartyMode: true });
                            return;
                        }
                        reset();
                    })
                );
            }

            this.setState({ cells });
        });

        resetButton.addEventListener("click", () => reset());

        controller.listenCommand((key) => {
            const move = moveHandler[key];
            const hasMoved = move();

            // spawn cell if has moved
            if (hasMoved) board.spawnCells(1);
        });

        if (this.state.cells.length > 0) {
            board.restore(this.state.cells);
        } else {
            reset();
        }

        renderer.mount();
        currentScoreValue.innerHTML = String(this.state.score);
    }

    private isWin(cells: Cell[]): boolean {
        const GOAL = 2048;
        return cells.some((cell) => cell.value === GOAL);
    }

    private isGameOver(cells: Cell[]) {
        const getCoordsKey = (coords: Coords) => `${coords.x}x${coords.y}`;

        const noEmptyCells = cells.length === this.cfg.boardSize ** 2;

        if (!noEmptyCells) {
            return false;
        }

        const cellsMap: Record<string, Cell> = cells.reduce((acc, cell) => ((acc[getCoordsKey(cell.coords)] = cell), acc), {} as any);

        return cells.every((cell) => {
            const siblings = [
                cellsMap[getCoordsKey({ x: cell.x + 1, y: cell.y })],
                cellsMap[getCoordsKey({ x: cell.x - 1, y: cell.y })],
                cellsMap[getCoordsKey({ x: cell.x, y: cell.y + 1 })],
                cellsMap[getCoordsKey({ x: cell.x, y: cell.y - 1 })],
            ];

            return siblings.every((sib) => !sib || sib.value !== cell.value);
        });
    }
}

let isLocked = false;
const locked = async <T>(callback: () => T) => {
    if (!isLocked) {
        isLocked = true;
        const res = await callback();
        isLocked = false;
        return res;
    }
};
