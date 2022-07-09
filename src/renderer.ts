import { Cell } from "./board";
import { calcIndexByCoords, insertChildAtIndex, range } from "./utils";

/**
 * Отрисовка происходит в несколько этапов
 * Первоначально мы рисуем все клетки в обычном порядке, для каждой клетки мы должны хранить, атрибут с ее ключом
 * При перерисовке мы должны вычислить, изначальный порядок относительно каждой клетки, и применить transform, к тем чей
 * порядок изменился, а также обновить все значения (value etc)
 *
 * При перерисовке, мы также должны удалить неиспользуемые элементы
 */

export class Renderer {
    private renderCleanup: VoidFunction[] = [];

    private static CELL_GAP_VAR = "--cell-gap";
    private static CELL_SIZE_VAR = "--cell-size";
    private static BOARD_SIZE_VAR = "--board-size";

    private static MOVE_TRANSITION_MS = 100;

    private boardGridElement: HTMLElement = null!;
    private boardSceneElement: HTMLElement = null!;

    constructor(private boardElement: HTMLElement, private boardSize: number) {
        this.boardGridElement = boardElement.querySelector(".board-grid")!;
        this.boardSceneElement = boardElement.querySelector(".board-scene")!;
    }

    private static getCSSVar(name: string) {
        return getComputedStyle(document.documentElement).getPropertyValue(name);
    }
    private static setCSSVar(name: string, value: string) {
        return document.documentElement.style.setProperty(name, value);
    }

    public mount() {
        const cellSizeCSS = `calc(var(${Renderer.BOARD_SIZE_VAR}) / ${this.boardSize})`;
        const cellGapCSS = `calc(var(${Renderer.CELL_SIZE_VAR}) * 0.08) `;

        Renderer.setCSSVar(Renderer.CELL_SIZE_VAR, cellSizeCSS);
        Renderer.setCSSVar(Renderer.CELL_GAP_VAR, cellGapCSS);

        const createEmptyCell = () => {
            const element = document.createElement("div");
            element.classList.add("cell", "cell-empty");
            return element;
        };

        this.boardGridElement.replaceChildren(...Array.from(range(this.boardSize ** 2)).map(() => createEmptyCell()));
    }

    private static createCellElement(cell: Cell) {
        return Renderer.updateCellElement(cell, document.createElement("div"), true);
    }

    public static updateCellElement(cell: Cell, element: HTMLElement, useAbsolute?: boolean) {
        element.className = ""; // cleanup all classNames before

        element.classList.add("cell", "cell-filled", `cell-${cell.value}`);
        element.setAttribute("data-key", cell.key);

        const shiftStep = `calc(var(${Renderer.CELL_SIZE_VAR}) + var(${Renderer.CELL_GAP_VAR}) * 0.25)`;
        const xShift = `calc(${shiftStep} * ${cell.x})`;
        const yShift = `calc(${shiftStep} * ${cell.y})`;

        // if (useAbsolute) {
        //     element.style.transform = "";
        //     element.style.top = xShift;
        //     element.style.left = yShift;
        // } else {
        //     element.style.top = "";
        //     element.style.left = "";
        //     element.style.transform = `translate(${xShift}, ${yShift})`;
        // }

        element.style.transform = "";
        element.style.top = yShift;
        element.style.left = xShift;

        element.innerHTML = String(cell.value);

        return element;
    }

    private getSceneCellElements(): Array<HTMLElement> {
        return Array.from(this.boardElement.querySelectorAll(".board-scene .cell"));
    }

    private createHooks = () => {
        this.renderCleanup.forEach((cleanup) => cleanup());
        this.renderCleanup = [];

        // let transitionStarted = false;
        // const alreadyHandled = new Set<VoidFunction>();

        // const _beforeTransitionHandler = () => {
        //     transitionStarted = true;
        // };
        // this.boardSceneElement.addEventListener("transitionstart", _beforeTransitionHandler);
        // this.renderCleanup.push(() => this.boardSceneElement.removeEventListener("transitionstart", _beforeTransitionHandler));

        const afterTransition = (callback: VoidFunction) => {
            // const handler = () => {
            //     if (!alreadyHandled.has(callback)) {
            //         callback();
            //         alreadyHandled.add(callback);
            //     }
            // };

            // if (!transitionStarted) {
            //     handler();
            //     return;
            // }

            const timerID = window.setTimeout(callback, Renderer.MOVE_TRANSITION_MS);
            this.renderCleanup.push(() => clearTimeout(timerID));

            // this.boardSceneElement.addEventListener("transitionend", handler);
            // this.boardSceneElement.addEventListener("transitioncancel", handler);
            // this.renderCleanup.push(
            //     () => this.boardSceneElement.removeEventListener("transitionend", handler),
            //     () => this.boardSceneElement.removeEventListener("transitioncancel", handler)
            // );
        };
        return { afterTransition };
    };

    public render(cells: Cell[]) {
        const hooks = this.createHooks();
        const cellElements = this.getSceneCellElements();
        const currentKeys = new Set(cells.map((c) => c.key));

        const getDataKey = (el: HTMLElement) => String(el.getAttribute("data-key"));
        const getElementByKey = (key: string) => cellElements.find((el) => getDataKey(el) === key);
        // const getCellByKey = (key: string) => cells.find((cell) => cell.key === key);

        if (!cellElements.length) {
            this.boardSceneElement.replaceChildren(...cells.map((cell) => Renderer.createCellElement(cell)));
            return;
        }

        // creating new cells and updating an existed
        for (const cell of cells) {
            const element = getElementByKey(cell.key);

            if (!element) {
                // create new element
                const newElement = Renderer.createCellElement(cell);
                // newElement.style.transform = "";
                // const shiftCSS = `calc(var(${Renderer.CELL_SIZE_VAR}) + var(${Renderer.CELL_GAP_VAR}) * 0.25)`;
                // newElement.style.top = `calc(${shiftCSS} * ${cell.x})`;
                // newElement.style.left = `calc(${shiftCSS} * ${cell.y})`;

                // newElement.classList.add('no-transition')
                // hooks.afterTransition(() => this.boardSceneElement.append(newElement));
                // this.boardSceneElement.append(newElement);
                // this.boardSceneElement.append(newElement);
                hooks.afterTransition(() => this.boardSceneElement.append(newElement));
                continue;
            }

            Renderer.updateCellElement(cell, element);
        }

        const removedElements = cellElements.filter((el) => !currentKeys.has(getDataKey(el)));

        for (const removedEl of removedElements) {
            // hooks.afterTransition(() => removedEl.remove());
            removedEl.remove();
        }
    }
}
