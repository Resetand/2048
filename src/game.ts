import { Board, Cell } from "./board";
import { ControlledKey, Controller } from "./controller";
import { Storage } from "./storage";
import { Renderer } from "./renderer";
import { Coords } from "./types";

type GameConfig = {
    boardElement: HTMLElement;
    scoreValueElement: HTMLElement;
    boardSize: number;
};

export class Game {
    constructor(private cfg: GameConfig) {}

    bootstrap() {
        const resetButton = document.getElementById("reset-button")!;
        const currentScoreValue = document.getElementById("current-score-value")!;

        const persisted = Storage.load();

        const controller = new Controller();
        const renderer = new Renderer(this.cfg.boardElement, this.cfg.boardSize);
        const board = new Board(persisted?.boardSize ?? this.cfg.boardSize);

        const moveHandler = {
            [ControlledKey.UP]: () => board.move("y", -1),
            [ControlledKey.DOWN]: () => board.move("y", 1),
            [ControlledKey.LEFT]: () => board.move("x", -1),
            [ControlledKey.RIGHT]: () => board.move("x", 1),
        };

        board.onUpdate(({ cells }) => {
            if (this.isGameOver(cells)) {
                alert("Game Over!");
                board.reset();
                board.spawnCells(2);
                return;
            }

            const score = cells.reduce((acc, cell) => acc + cell.value, 0);
            currentScoreValue.innerHTML = String(score);

            renderer.render(cells);
            Storage.save({ cells, boardSize: this.cfg.boardSize });
        });

        resetButton.addEventListener("click", () => {
            board.reset();
            board.spawnCells(2);
        });

        controller.listenControlledKeys((key) => {
            const move = moveHandler[key];
            const hasMoved = move();

            // spawn cell if has moved
            if (hasMoved) board.spawnCells(1);
        });

        if (persisted) {
            board.restore(persisted.cells);
        } else {
            board.reset();
            board.spawnCells(2);
        }

        renderer.mount();
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
