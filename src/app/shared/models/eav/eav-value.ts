import { Value1 } from '../json-format-v1/value1';
import { EavDimensions } from './eav-dimensions';

export class EavValue<T> {
    value: T;
    dimensions: EavDimensions<T>[];

    constructor(value: T, dimensions: EavDimensions<T>[]) {
        this.value = value;
        this.dimensions = dimensions;
    }

    /**
     * Create Eav Value from typed json Value1
     * @param value
     */
    public static create<T>(value1: Value1<T>): EavValue<T>[] {

        const newEavValueArray: EavValue<T>[] = []; // = new EavValue(value1,);
        // Loop trough value1 - {'*', 'value'} ...
        Object.keys(value1).forEach(value1Key => {
            if (value1.hasOwnProperty(value1Key)) {
                const dimensions: EavDimensions<T>[] = [];

                value1Key.split(',').forEach((language: any) => {
                    dimensions.push(new EavDimensions<T>(language));
                });
                // Creates new EavValue for specified type and add to array
                newEavValueArray.push(new EavValue(value1[value1Key], dimensions));
            }
        });

        return newEavValueArray;
    }
}
