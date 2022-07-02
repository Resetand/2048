export const randomize = (min: number, max: number, cfg?: { exclude: number[] }): number => {
    const value = Math.floor(Math.random() * (max - min + 1) + min);
    if (!cfg?.exclude.includes(value)) {
        return value;
    }
    return randomize(min, max, cfg);
};

export const isPowerOfTwo = (value: number) => {
    return (Math.log(value) / Math.log(2)) % 1 === 0;
};
