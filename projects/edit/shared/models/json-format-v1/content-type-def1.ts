import { AttributeDef1 } from './attribute-def1';
import { Entity1 } from './entity1';

export class ContentTypeDef1 {
    Id: string;
    Name: string;
    Scope: string;
    Description: string;
    Attributes: AttributeDef1[];
    Metadata: Entity1[];

    constructor(Id: string, Name: string, Scope: string, Description: string, Attributes: AttributeDef1[], Metadata: Entity1[]) {
        this.Id = Id;
        this.Name = Name;
        this.Scope = Scope;
        this.Description = Description;
        this.Attributes = Attributes;
        this.Metadata = Metadata;
    }
}
