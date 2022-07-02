import { Board } from "./board";
import { ControlledKey, Controller } from "./controller";

export class Game {
    private board: Board = null!;
    private controller: Controller = null!;

    public constructor(boardElement: HTMLElement, size = 4) {
        const controller = new Controller(boardElement);
        const board = new Board(size);

        const handler = {
            [ControlledKey.UP]: () => board.up(),
            [ControlledKey.DOWN]: () => board.down(),
            [ControlledKey.LEFT]: () => board.left(),
            [ControlledKey.RIGHT]: () => board.right(),
        };

        controller.listenControlledKeys((key) => {
            handler[key]();
            this.controller.draw(this.board.getCells());
        });

        this.board = board;
        this.controller = controller;
    }

    reset() {
        alert("here");
        this.board.reset();
        this.controller.draw(this.board.getCells());
    }
}
