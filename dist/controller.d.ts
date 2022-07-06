export declare enum Command {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}
declare type CommandHandler = (command: Command, event: KeyboardEvent | TouchEvent) => void;
export declare class Controller {
    private boardElement;
    constructor(boardElement: HTMLElement);
    private KEY_MAP;
    listenCommand(handler: CommandHandler): {
        unsubscribe: () => void;
    };
    private keysListen;
    private gestureListen;
}
export {};
