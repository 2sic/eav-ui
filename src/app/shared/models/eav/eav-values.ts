import { Value1 } from '../json-format-v1/value1';
import { EavValue } from './eav-value';

export class EavValues<T> {
    values: EavValue<any>[];
    type: string;

    constructor(values: EavValue<T>[], type: string) {
        this.values = values;
        this.type = type;
    }

    /**
     * Create Eav Value from typed json Value1
     * @param value
     */
    public static create<T>(value1: Value1<T>, type: string): EavValues<T> {
        return new EavValues<T>(EavValue.create(value1), type);
    }
}
