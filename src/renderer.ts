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
        const cellGapCSS = `calc(var(${Renderer.CELL_SIZE_VAR}) * 0.03) `;

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
        return Renderer.updateCellElement(cell, document.createElement("div"));
    }

    public static updateCellElement(cell: Cell, element: HTMLElement) {
        element.className = ""; // cleanup all classNames before

        element.classList.add("cell", "cell-filled", `cell-${cell.value}`);
        element.setAttribute("data-key", cell.key);

        const shiftStep = `calc(var(${Renderer.CELL_SIZE_VAR}) + var(${Renderer.CELL_GAP_VAR}) * 0.25)`;
        const xShift = `calc(${shiftStep} * ${cell.x})`;
        const yShift = `calc(${shiftStep} * ${cell.y})`;

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

        const afterTransition = (callback: VoidFunction) => {
            const timerID = window.setTimeout(callback, Renderer.MOVE_TRANSITION_MS);
            this.renderCleanup.push(() => clearTimeout(timerID));
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
                hooks.afterTransition(() => this.boardSceneElement.append(newElement));
                continue;
            }

            Renderer.updateCellElement(cell, element);
        }

        const removedElements = cellElements.filter((el) => !currentKeys.has(getDataKey(el)));

        for (const removedEl of removedElements) {
            removedEl.remove();
        }
    }
}
