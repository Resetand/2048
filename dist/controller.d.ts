export declare enum ControlledKey {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}
export declare class Controller {
    private KEY_MAP;
    listenControlledKeys(handler: (key: ControlledKey, event: KeyboardEvent) => void): {
        unsubscribe: () => void;
    };
}
