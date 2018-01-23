import { JsonHeader1 } from '../json-format-v1/json-header1';

export class EavHeader {
    v: number;

    constructor(v: number) {
        this.v = v;
    }

    /**
     * Create Eav Header from typed json JsonHeader1
     * @param item
     */
    public static create(item: JsonHeader1): EavHeader {
        return new EavHeader(item.V);
    }
}
