export class EavValue<T> {
    value: string;
    dimensions: T;

    constructor(value: string, dimensions: T) {
        this.value = value;
        this.dimensions = dimensions;
    }

    public static create<T>(value: string, dimensions: T): EavValue<T> {
        return new EavValue<T>(value, dimensions);
    }
}

