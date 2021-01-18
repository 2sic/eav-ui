import { AttributeDef1 } from './attribute-def1';
import { Entity1 } from './entity1';

export class ContentType1 {
    Attributes: AttributeDef1[];
    Description: string;
    Id: string;
    Metadata: Entity1[];
    Name: string;
    Scope: string;

    constructor(Id: string, Name: string, Scope: string, Description: string, Attributes: AttributeDef1[], Metadata: Entity1[]) {
        this.Id = Id;
        this.Name = Name;
        this.Scope = Scope;
        this.Description = Description;
        this.Attributes = Attributes;
        this.Metadata = Metadata;
    }
}
