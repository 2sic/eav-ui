import { Value1 } from '../json-format-v1/value1';

export class EavDimensions<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }

    /**
     * Create Eav Dimensions from typed json Value1
     * @param value
     */
    /* public static create<T>(value1: Value1<T>): EavDimensions<T>[] {

        const asd: EavDimensions<T> = new EavDimensions<T>();

        const asdarray: EavDimensions<T>[] = [];

        // Loop trough attribute - Description, Name ...
        Object.keys(value1).forEach(value1Key => {
            if (value1.hasOwnProperty(value1Key)) {
                // Creates new EavValue for specified type
                newEavAtribute[attribute1Key] = EavValue.create<any>(attribute1[attribute1Key]);
            }
        });

        asdarray.push(new )

        return new EavDimensions<T>('*', value['*']);
    } */
}
