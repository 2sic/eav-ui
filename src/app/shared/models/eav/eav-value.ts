export class EavValue<T> {
    value: string;
    dimensions: T;

    constructor(value: string, dimensions: T) {
        this.value = value;
        this.dimensions = dimensions;
    }
}

