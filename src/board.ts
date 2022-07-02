import { isPowerOfTwo, randomize } from "./utils";

export class Board {
    private cells: Cell[] = null!;

    public constructor(public size: number) {
        this.cells = [];

        Array.from({ length: size ** 2 }).forEach((_, index) => {
            this.cells.push(new Cell(index, null));
        });
    }

    public reset() {
        this.cells = [];

        Array.from({ length: this.size ** 2 }).forEach((_, index) => {
            this.cells.push(new Cell(index, null));
        });

        // create cells on 2 random places
        this.createAtRandom();
        this.createAtRandom();
    }

    public getCells() {
        return this.cells;
    }

    public up() {
        //
    }

    public down() {
        //
    }

    public left() {
        //
    }

    public right() {
        //
    }

    private createAtRandom(value = 2) {
        const filledPositions = this.cells.filter((c) => c.value !== null).map((c) => c.position);
        const unusedRandom = randomize(0, this.size ** 2, { exclude: filledPositions });
        this.cells[unusedRandom] = new Cell(unusedRandom, value);
    }
}

export class Cell {
    public constructor(public position: number, public value: number | null) {
        if (value !== null && !isPowerOfTwo(value)) {
            throw TypeError("Value must be a power of 2");
        }
    }
}
