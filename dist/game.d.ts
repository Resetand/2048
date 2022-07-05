declare type GameConfig = {
    boardElement: HTMLElement;
    scoreValueElement: HTMLElement;
    boardSize: number;
};
export declare class Game {
    private cfg;
    constructor(cfg: GameConfig);
    bootstrap(): void;
    private isWin;
    private isGameOver;
}
export {};
