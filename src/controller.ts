import { Cell } from "./board";

export enum ControlledKey {
    LEFT,
    UP,
    RIGHT,
    DOWN,
}

export class Controller {
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

            if (controlledKey !== undefined) {
                handler(controlledKey, event);
            }
        };

        document.addEventListener("keydown", listener);

        return {
            unsubscribe: () => document.removeEventListener("keydown", listener),
        };
    }
}
