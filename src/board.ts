import { Coords } from "./types";
import { calcCoordsByIndex, calcIndexByCoords, generateId, isPowerOfTwo, matrixIterator, randomize, range, deepEqual } from "./utils";
import { EventEmitter } from "events";

type BoardState = { cells: Cell[] };
type BoardMatrix = (Cell | null)[][];

export class Board {
    private state: Readonly<BoardState> = { cells: [] };
    private ee = new EventEmitter();
    private static UPDATE_EVENT = "STATE_CHANGED_EVENT";

    constructor(private readonly boardSize: number) {}

    public onUpdate(handler: (state: BoardState, prevState: BoardState) => void) {
        this.ee.addListener(Board.UPDATE_EVENT, (prevState: BoardState) => handler(this.state, prevState));
    }

    public restore(cells: Cell[]) {
        this.setState({ cells });
    }

    public reset() {
        this.setState({ cells: [] });
    }

    public get sortedCells() {
        return [...this.state.cells].sort(
            (a, b) => calcIndexByCoords(a.coords, this.boardSize) - calcIndexByCoords(b.coords, this.boardSize)
        );
    }

    public move(axis: keyof Coords, step: -1 | 1): boolean {
        const boardSize = this.boardSize;

        let hasMoved = false;

        const mtxBefore = this.getBoardMatrix();
        const mtx = this.getBoardMatrix();

        const mergedKeys = new Set<string>();

        for (const { value: cell, x, y } of matrixIterator(mtx, axis, Math.sign(step) > 0)) {
            if (!cell) continue; // skip empty values

            const canMove = (pointer: number) => (Math.sign(step) > 0 ? pointer < boardSize - 1 : pointer > 0);
            const initialPointer = axis === "x" ? x : y;

            // Каждую непустую ячейку мы двигаем по оси, до тех пор пока:
            // - Доходим до края
            // - Доходим до ячейки с таким же значением (необходимо слить соседнии ячейки и пометить ее, тк складывать можно только 1 раз)

            for (let p = initialPointer; canMove(p); p += step) {
                const pos: Coords = axis === "x" ? { y, x: p } : { y: p, x };
                const sibPos: Coords = axis === "x" ? { y, x: p + step } : { y: p + step, x };

                const sibling = mtx[sibPos.y]?.[sibPos.x];

                if (sibling === null) {
                    // соседняя ячейка свободна - передвигаем текущую клетку
                    [mtx[pos.y][pos.x], mtx[sibPos.y][sibPos.x]] = [mtx[sibPos.y][sibPos.x], mtx[pos.y][pos.x]];
                    hasMoved = true;
                    continue;
                }

                if (sibling.value === cell.value && !mergedKeys.has(cell.key) && !mergedKeys.has(sibling.key)) {
                    // merge values (using sib cell) and mark it as merged
                    cell.doubleValue();
                    mtx[sibPos.y][sibPos.x] = cell;
                    mtx[pos.y][pos.x] = null;
                    mergedKeys.add(cell.key);
                    hasMoved = true;
                    break;
                }

                break;
            }
        }

        if (hasMoved) {
            // Конвертируем матрицу в массив ячеек и синхронизируем (координаты)
            const cells = Array.from(matrixIterator(mtx))
                .filter(({ value }) => value !== null)
                .map(({ value, x, y }) => (value?.setCoords({ x, y }), value!));

            this.setState({ cells });
        }

        return hasMoved;
    }

    private setState(patch: Partial<BoardState>) {
        const prevState = this.state;
        this.state = { ...prevState, ...patch };
        this.ee.emit(Board.UPDATE_EVENT, prevState);
    }

    public getBoardMatrix(): BoardMatrix {
        const boardSize = this.boardSize;
        const cells = this.state.cells;
        const mtx: BoardMatrix = Array.from({ length: boardSize }).map(() => Array.from({ length: boardSize }));

        for (const x of range(mtx.length)) {
            for (const y of range(mtx.length)) {
                mtx[y][x] = cells.find((cell) => cell.x === x && cell.y === y) ?? null;
            }
        }

        return mtx;
    }

    public spawnCells(count: number) {
        const boardSize = this.boardSize;
        const cells = [...this.state.cells];

        const createSpawnCell = () => {
            const INITIAL_VALUE = 2;

            const filledIndexes = cells.map((cell) => calcIndexByCoords(cell.coords, boardSize));
            const randomIndex = randomize(0, boardSize ** 2 - 1, { exclude: filledIndexes });
            const coords = calcCoordsByIndex(randomIndex, boardSize);

            return new Cell(coords, INITIAL_VALUE);
        };

        Array.from(range(count)).forEach(() => cells.push(createSpawnCell()));

        this.setState({ cells });
    }
}

export class Cell {
    public readonly key: string = null!;
    public readonly x: number = null!;
    public readonly y: number = null!;

    constructor(coords: Coords, public readonly value: number) {
        this.validateValue(value);
        this.x = coords.x;
        this.y = coords.y;
        this.key = generateId();
    }

    public doubleValue() {
        // @ts-ignore
        this.value = this.value * 2;
    }

    public setCoords(coords: Coords) {
        // @ts-ignore
        this.x = coords.x;
        // @ts-ignore
        this.y = coords.y;
    }

    public get coords(): Coords {
        return { x: this.x, y: this.y };
    }

    private validateValue(value: number) {
        if (!isPowerOfTwo(value)) {
            throw TypeError("Value must be a power of 2");
        }
    }
}
