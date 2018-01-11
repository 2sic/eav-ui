import { Attribute1 } from './attribute1';
import { Type1 } from './type1';
import { Metadata1 } from './metadata1';

export class Entity1 {
    Id: number;
    Version: number;
    Guid: string;
    Type: Type1;
    Attributes: Attribute1;
    Owner: string;
    Metadata: Metadata1[];

    constructor(Id: number, Version: number, Guid: string, Type: Type1, Attributes: Attribute1, Owner: string, Metadata: Metadata1[]) {
        this.Id = Id;
        this.Version = Version;
        this.Guid = Guid;
        this.Type = Type;
        this.Attributes = Attributes;
        this.Owner = Owner;
        this.Metadata = Metadata;
    }

    public static create(item: Entity1): Entity1 {
        return new Entity1(item.Id, item.Version, item.Guid, item.Type, item.Attributes, item.Owner, []); // TODO Metadata and attibutes
    }
}


