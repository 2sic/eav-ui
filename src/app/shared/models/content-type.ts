import { Attribute } from './attribute';

export class ContentType {
    public id: string;
    public name: string;
    public scope: string;
    public description: string;
    public attributes: Attribute[];

    constructor(id: string, name: string, scope: string, description: string, attributes: Attribute[]) {
        this.id = id;
        this.name = name;
        this.scope = scope;
        this.description = description;
        this.attributes = attributes;
    }
}
