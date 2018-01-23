import { Value1 } from '../json-format-v1/value1';
import { EavDimensions } from './eav-dimensions';
import { EavValue } from './eav-value';

export class EavValues<T> {
    values: EavValue<any>[];

    constructor(values: EavValue<T>[]) {
        this.values = values;
    }

    /**
     * Create Eav Value from typed json Value1
     * @param value
     */
    public static create<T>(value1: Value1<T>): EavValues<T> {
        return new EavValues<T>(EavValue.create(value1));
    }
}
