import { Attribute1 } from './attribute1';

export class ContentType1 {
    Id: string;
    Name: string;
    Scope: string;
    Description: string;
    Attributes: Attribute1[];

    constructor(Id: string, Name: string, Scope: string, Description: string, Attributes: Attribute1[]) {
        this.Id = Id;
        this.Name = Name;
        this.Scope = Scope;
        this.Description = Description;
        this.Attributes = Attributes;
    }

    public static create(item: ContentType1): ContentType1 {
        return new ContentType1(item.Id, item.Name, item.Scope, item.Description, []); // TODO Atributes
    }
}
