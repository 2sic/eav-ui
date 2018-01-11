export class JsonHeader1 {
    public V: number;

    constructor(V: number) {
        this.V = V;
    }

    public static create(item: JsonHeader1): JsonHeader1 {
        return new JsonHeader1(item.V);
    }
}
