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

        // this.boardSceneElement.replaceChildren(...cells.map((cell) => Renderer.createCellElement(cell)));

        // cells.forEach((cell) => {
        // const key = cell.key;
        // const el = getElementByKey(key);
        // // Заменяем удаленные элементы на новые
        // if (!el) {
        //     // hack for animation
        //     const newEl = Renderer.createCellElement(cell);
        //     newEl.classList.add("no-appear", "cell-empty");
        //     insertChildAtIndex(this.boardElement, newEl, cell.position);
        //     let interrupted = false;
        //     setTimeout(() => !interrupted && newEl.replaceWith(Renderer.createCellElement(cell)), 100);
        //     this.cleanupCbsBeforeRerender.push(() => void (interrupted = true));
        //     return;
        // }
        // el.classList.forEach((className) => /cell-\d+/.test(className) && el!.classList.remove(className));
        // el.innerHTML = !cell.isEmpty() ? String(cell.value) : "";
        // if (cell.isEmpty()) {
        //     el.classList.remove("cell-filled");
        // } else {
        //     el.classList.add("cell-filled", `cell-${cell.value}`);
        // }
        // });

        // const cells = [..._cells].sort((a, b) => calcIndexByCoords(a.coords, this.boardSize) - calcIndexByCoords(b.coords, this.boardSize)); // sorted cells
        // this.cleanupCbsBeforeRerender.forEach((cb) => cb());
        // this.cleanupCbsBeforeRerender = [];
        // const relevantKeys = new Set(cells.map((cell) => cell.key));
        // const allCellElements = this.getAllCellElements();
        // const getDataKey = (el: HTMLElement) => String(el.getAttribute("data-key"));
        // const getElementByKey = (key: string) => allCellElements.find((el) => getDataKey(el) === key);
        // const getCellByKey = (key: string) => cells.find((cell) => cell.key === key);
        // if (allCellElements.length !== cells.length) {
        //     this.initialRender(cells);
        //     return;
        // }
        // // ! cleanup
        // // Этап, на котором удаляем неиспользуемые DOM элементы
        // // Это пустые клетки, на месте которых должны появиться новые значения
        // allCellElements.forEach((el) => {
        //     if (!relevantKeys.has(getDataKey(el))) {
        //         el.remove();
        //     }
        // });
        // // ! hydrate
        // // Этап, на котором мы синхронизируем данные с состоянием в DOM
        // // Здесь мы не меняем порядок DOM элементов, только актуализируем содержание ячейки по
        // // соответствующему ключу, или создаем новую, если ее нет в DOM

        // // ! animate
        // // Здесь мы должны на основе актуального дом дерева и состояния передвинуть клетки,
        // // используя css, так, чтобы все стало на свои места
        // this.getAllCellElements().forEach((el, viewPosition) => {
        //     const key = getDataKey(el);
        //     const cell = getCellByKey(key)!;
        //     const actualCoords = cell.coords;
        //     const viewCoords = calcCoordsByIndex(viewPosition, cell.boardsSize);
        //     const coordsDiff = {
        //         x: actualCoords.x - viewCoords.x,
        //         y: actualCoords.y - viewCoords.y,
        //     };
        //     const transforms: string[] = [];
        //     const makeTranslate = (axis: "X" | "Y", value: number) => {
        //         const outerSize = "calc(var(--cell-size) + var(--cell-gap) * 0.25)";
        //         return `translate${axis}(calc(${outerSize} * ${value}))`;
        //     };
        //     if (coordsDiff.x) {
        //         transforms.push(makeTranslate("X", coordsDiff.x));
        //     }
        //     if (coordsDiff.y) {
        //         transforms.push(makeTranslate("Y", coordsDiff.y));
        //     }
        //     el.style.transform = transforms.join(" ");
        // });
        // let processing = false;
        // const onTransitionFinished = () => {
        //     if (!processing) {
        //         processing = true;
        //         const children = this.getAllCellElements();
        //         const getPos = (el: HTMLElement) => getCellByKey(getDataKey(el))!.position;
        //         children.forEach((el) => {
        //             el.style.transform = "";
        //             el.classList.add("no-appear");
        //         });
        //         this.boardElement.replaceChildren(...children.sort((a, b) => getPos(a) - getPos(b)));
        //     }
        // };
        // this.boardElement.addEventListener("transitionend", onTransitionFinished);
        // // this.boardElement.addEventListener("transitioncancel", onTransitionFinished);
        // this.cleanupCbsBeforeRerender.push(
        //     () => this.boardElement.removeEventListener("transitionend", onTransitionFinished)
        //     // () => this.boardElement.removeEventListener("transitioncancel", onTransitionFinished)
        // );
    }
}
