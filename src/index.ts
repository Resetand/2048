import { Game } from "./game";

const boardElement = document.getElementById("board-root")!;
const scoreValueElement = document.getElementById("score-value")!;

const game = new Game({
    scoreValueElement,
    boardElement,
    boardSize: 4,
});

game.bootstrap();

/***********************************/
/********* SERVICE WORKER **********/
/***********************************/

/* Put code here */

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
}
