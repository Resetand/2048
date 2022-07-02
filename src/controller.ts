import { Cell } from "./board";

export enum ControlledKey {
    LEFT,
    UP,
    RIGHT,
    DOWN,
}

export class Controller {
    public constructor(private boardElement: HTMLElement) {}

    private KEY_MAP: Record<string, ControlledKey> = {
        w: ControlledKey.UP,
        ArrowUp: ControlledKey.UP,

        s: ControlledKey.DOWN,
        ArrowDown: ControlledKey.DOWN,

        a: ControlledKey.LEFT,
        ArrowLeft: ControlledKey.LEFT,

        d: ControlledKey.RIGHT,
        ArrowRight: ControlledKey.RIGHT,
    };

    public listenControlledKeys(handler: (key: ControlledKey, event: KeyboardEvent) => void) {
        const listener = (event: KeyboardEvent) => {
            const controlledKey = this.KEY_MAP[event.key];
            if (controlledKey) {
                handler(controlledKey, event);
            }
        };

        window.addEventListener("keydown", listener);

        return {
            unsubscribe: () => window.removeEventListener("keydown", listener),
        };
    }

    public createCellElement(cell: Cell) {
        const el = document.createElement("div");
        el.classList.add("cell");
        el.classList.add(`cell-${cell.value}`);
        el.innerHTML = String(cell.value);
        return el;
    }

    public draw(cells: Cell[]) {
        alert("draw");

        // ????
        (this.boardElement as any).replaceChildren(...cells.map((cell) => this.createCellElement(cell)));
    }
}
