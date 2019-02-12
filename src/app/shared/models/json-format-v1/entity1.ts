import { Attributes1 } from './attributes1';
import { Type1 } from './type1';
import { EavEntity } from '../eav';
import { For1 } from './for1';

export class Entity1 {
    Id: number;
    Version: number;
    Guid: string;
    Type: Type1;
    Attributes: Attributes1;
    Owner: string;
    Metadata: Entity1[];
    For?: For1;

    constructor(
        Id: number, Version: number, Guid: string, Type: Type1, Attributes: Attributes1, Owner: string, Metadata: Entity1[], For?: For1
    ) {
        this.Id = Id;
        this.Version = Version;
        this.Guid = Guid;
        this.Type = Type;
        this.Attributes = Attributes;
        this.Owner = Owner;
        this.Metadata = Metadata;
        this.For = For;
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
        let for1;
        if (entity.For) {
            for1 = new For1(entity.For.string, entity.For.target);
        }

        return new Entity1(
            entity.id,
            entity.version,
            entity.guid,
            new Type1(entity.type.id, entity.type.name),
            attributes1,
            entity.owner,
            metaData1,
            for1
        );
    }


    public static createArray(eavEntityArray: EavEntity[]): Entity1[] {
        if (!eavEntityArray) {
            return null;
        }
        const metaData1Array: Entity1[] = new Array<Entity1>();
        eavEntityArray.forEach(eavEntity => {
            metaData1Array.push(Entity1.create(eavEntity));
        });
        return metaData1Array;
    }
}
