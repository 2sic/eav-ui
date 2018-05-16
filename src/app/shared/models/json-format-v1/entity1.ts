import { Attributes1 } from './attributes1';
import { Type1 } from './type1';
import { EavEntity } from '../eav';

export class Entity1 {
    Id: number;
    Version: number;
    Guid: string;
    Type: Type1;
    Attributes: Attributes1;
    Owner: string;
    Metadata: Entity1[];

    constructor(Id: number, Version: number, Guid: string, Type: Type1, Attributes: Attributes1, Owner: string, Metadata: Entity1[]) {
        this.Id = Id;
        this.Version = Version;
        this.Guid = Guid;
        this.Type = Type;
        this.Attributes = Attributes;
        this.Owner = Owner;
        this.Metadata = Metadata;
    }

    /* public static create(item: Entity1): Entity1 {
        return new Entity1(item.Id,
            item.Version,
            item.Guid,
            item.Type,
            item.Attributes,
            item.Owner,
            item.Metadata);
    } */


    public static create(entity: EavEntity): Entity1 {
        const attributes1 = Attributes1.create(entity.attributes);
        const metaData1 = this.createArray(entity.metadata);

        return new Entity1(
            entity.id,
            entity.version,
            entity.guid,
            new Type1(entity.type.id, entity.type.name),
            attributes1,
            entity.owner,
            metaData1);
    }


    public static createArray(eavEntityArray: EavEntity[]): Entity1[] {
        const metaData1Array: Entity1[] = new Array<Entity1>();
        if (eavEntityArray !== undefined && eavEntityArray !== null) {
            eavEntityArray.forEach(eavEntity => {
                metaData1Array.push(Entity1.create(eavEntity));
            });
        }
        return metaData1Array;
    }
}
