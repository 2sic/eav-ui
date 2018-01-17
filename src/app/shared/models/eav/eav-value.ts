import { Value1 } from '../json-format-v1/value1';

export class EavValue<T> {
    value: string;
    dimensions: T; // TODO: Dictionary<string, bool> Dimensions

    constructor(value: string, dimensions: T) {
        this.value = value;
        this.dimensions = dimensions;
    }

    /**
     * Create Eav Value from typed json Value1
     * @param value
     */
    public static create<T>(value: Value1<T>): EavValue<T> {
        return new EavValue<T>('*', value['*']);
    }
}
