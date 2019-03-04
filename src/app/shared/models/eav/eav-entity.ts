import { EavAttributes } from './eav-attributes';
// import { EavAttributes } from './eav-attributes';
import { EavType } from './eav-type';
import { Entity1 } from '../json-format-v1/entity1';
import { EavFor } from './eav-for';

export class EavEntity {
    // appId ???
    id: number;
    version: number;
    guid: string;
    // title - from attribute ???
    type: EavType; // ContentType
    attributes: EavAttributes;
    owner: string;
    metadata: EavEntity[];
    For?: EavFor;

    constructor(
        id: number,
        version: number,
        guid: string,
        type: EavType,
        attributes: EavAttributes,
        owner: string,
        metadata: EavEntity[],
        For?: EavFor
    ) {
        this.id = id;
        this.version = version;
        this.guid = guid;
        this.type = type;
        this.attributes = attributes;
        this.owner = owner;
        this.metadata = metadata;
        this.For = For;
    }

    /**
     * Create new Eav Entity from typed json Entity1
     * @param item
     */
    public static create(item: Entity1): EavEntity {
        if (!item) {
            return new EavEntity(
                0,
                1,
                '00000000-0000-0000-0000-000000000000',
                null,
                new EavAttributes(),
                '',
                null);
        }
        const eavAttributes = EavAttributes.create(item.Attributes);
        const eavMetaData = this.createArray(item.Metadata);
        let eavFor: EavFor;
        if (item.For) {
            eavFor = new EavFor(item.For.String, item.For.Target);
        }

        return new EavEntity(
            item.Id,
            item.Version,
            item.Guid,
            new EavType(item.Type.Id, item.Type.Name),
            eavAttributes,
            item.Owner,
            eavMetaData,
            eavFor
        );
    }

    /**
    * Create new MetaData Entity Array from json typed metadataArray Entity1[]
    * @param item
    */
    public static createArray(entity1Array: Entity1[]): EavEntity[] {
        if (!entity1Array) {
            return null;
        }
        const eavMetaDataArray: EavEntity[] = new Array<EavEntity>();
        console.log('entity1Array:', entity1Array);
        entity1Array.forEach(entity1 => {
            eavMetaDataArray.push(EavEntity.create(entity1));
        });
        return eavMetaDataArray;
    }
}


