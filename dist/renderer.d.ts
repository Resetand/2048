import { Cell } from "./board";
/**
 * Отрисовка происходит в несколько этапов
 * Первоначально мы рисуем все клетки в обычном порядке, для каждой клетки мы должны хранить, атрибут с ее ключом
 * При перерисовке мы должны вычислить, изначальный порядок относительно каждой клетки, и применить transform, к тем чей
 * порядок изменился, а также обновить все значения (value etc)
 *
 * При перерисовке, мы также должны удалить неиспользуемые элементы
 */
export declare class Renderer {
    private boardElement;
    private boardSize;
    private renderCleanup;
    private static CELL_GAP_VAR;
    private static CELL_SIZE_VAR;
    private static BOARD_SIZE_VAR;
    private static MOVE_TRANSITION_MS;
    private boardGridElement;
    private boardSceneElement;
    constructor(boardElement: HTMLElement, boardSize: number);
    private static getCSSVar;
    private static setCSSVar;
    mount(): void;
    private static createCellElement;
    static updateCellElement(cell: Cell, element: HTMLElement, useAbsolute?: boolean): HTMLElement;
    private getSceneCellElements;
    private createHooks;
    render(cells: Cell[]): void;
}
