import { Cell } from "./board";

export enum Command {
    LEFT,
    UP,
    RIGHT,
    DOWN,
}

type CommandHandler = (command: Command, event: KeyboardEvent | TouchEvent) => void;

export class Controller {
    private KEY_MAP: Record<string, Command> = {
        w: Command.UP,
        ArrowUp: Command.UP,

        s: Command.DOWN,
        ArrowDown: Command.DOWN,

        a: Command.LEFT,
        ArrowLeft: Command.LEFT,

        d: Command.RIGHT,
        ArrowRight: Command.RIGHT,
    };

    public listenCommand(handler: CommandHandler) {
        const keysUnsubscribe = this.keysListen(handler);
        const gestureUnsubscribe = this.gestureListen(handler);

        return {
            unsubscribe: () => {
                keysUnsubscribe();
                gestureUnsubscribe();
            },
        };
    }

    private keysListen(handler: CommandHandler) {
        const listener = (event: KeyboardEvent) => {
            const controlledKey = this.KEY_MAP[event.key];

            if (controlledKey !== undefined) handler(controlledKey, event);
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }

    private gestureListen(handler: CommandHandler) {
        let touchstartX = 0;
        let touchstartY = 0;

        const touchStartListener = (e: TouchEvent) => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        };

        const touchEndListener = (e: TouchEvent) => {
            const touchendX = e.changedTouches[0].screenX;
            const touchendY = e.changedTouches[0].screenY;

            const diffX = Math.abs(touchendX - touchstartX);
            const diffY = Math.abs(touchendY - touchstartY);

            if (diffX < 10 && diffY < 10) {
                return;
            }

            if (diffX > diffY) {
                // horizontal swipe
                handler(touchendX < touchstartX ? Command.LEFT : Command.RIGHT, e);
            } else {
                // vertical swipe
                handler(touchendY < touchstartY ? Command.UP : Command.DOWN, e);
            }
        };
        document.addEventListener("touchstart", touchStartListener);
        document.addEventListener("touchend", touchEndListener);

        return () => {
            document.removeEventListener("touchstart", touchStartListener);
            document.removeEventListener("touchend", touchEndListener);
        };
    }
}
