export class Attribute {
    name: string;
    type: string;
    isTitle: boolean;

    constructor(name: string, type: string, isTitle: boolean) {
        this.name = name;
        this.type = type;
        this.isTitle = isTitle;
    }
}
