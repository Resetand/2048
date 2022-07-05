import { Game } from "./game";

const boardElement = document.getElementById("board-root")!;
const scoreValueElement = document.getElementById("score-value")!;

const game = new Game({
    scoreValueElement,
    boardElement,
    boardSize: 4,
});

game.bootstrap();
