import { Attributes1 } from './attributes1';

export class ContentType1 {
    Id: string;
    Name: string;
    Scope: string;
    Description: string;
    Attributes: Attributes1;

    constructor(Id: string, Name: string, Scope: string, Description: string, Attributes: Attributes1) {
        this.Id = Id;
        this.Name = Name;
        this.Scope = Scope;
        this.Description = Description;
        this.Attributes = Attributes;
    }

    public static create(item: ContentType1): ContentType1 {
        return new ContentType1(item.Id, item.Name, item.Scope, item.Description, item.Attributes); // TODO Atributes
    }
}
