type Transform<TData> = [(data: TData) => any, (loaded: any) => TData];

type TransformConfig<T extends Record<string, any>> = {
    [P in keyof T]+?: Transform<T[P]>;
};

export class Storage<T extends Record<string, any>> {
    constructor(private key: string, private transforms?: TransformConfig<T>) {}

    public save(_data: T) {
        const data = { ..._data };

        Object.entries(this.transforms ?? []).forEach(([key, [encode]]) => {
            if (data[key]) {
                data[key as keyof T] = encode(data[key]);
            }
        });

        localStorage.setItem(this.key, JSON.stringify(data));
    }
    public load(): T | null {
        const parsed = this.loadJson();

        if (!parsed) {
            return null;
        }

        Object.entries(this.transforms ?? []).forEach(([key, [, decode]]) => {
            if (parsed[key]) {
                parsed[key as keyof T] = decode(parsed[key]);
            }
        });

        return parsed;
    }

    public clear() {
        localStorage.removeItem(this.key);
    }

    private loadJson(): T | null {
        try {
            return JSON.parse(localStorage.getItem(this.key)!);
        } catch {
            return null;
        }
    }
}
