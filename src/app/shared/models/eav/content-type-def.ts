import { AttributeDef } from './attribute-def';
import { EavEntity } from './eav-entity';
import { ContentTypeDef1 } from '../json-format-v1/content-type-def1';
import { EavAttributes } from './eav-attributes';

export class ContentTypeDef {
    id: string;
    name: string;
    scope: string;
    description: string;
    attributes: AttributeDef[];
    metadata: EavEntity[];
    settings: EavAttributes;

    constructor(
        id: string,
        name: string,
        scope: string,
        description: string,
        attributes: AttributeDef[],
        metadata: EavEntity[],
        settings: EavAttributes
    ) {
        this.id = id;
        this.name = name;
        this.scope = scope;
        this.description = description;
        this.attributes = attributes;
        this.metadata = metadata;
        this.settings = settings;
    }

    /**
     * Create ContentTypeDef from json typed ContentType1
     * @param item
     */
    public static create(item: ContentTypeDef1): ContentTypeDef {
        const attributeDefArray = AttributeDef.createArray(item.Attributes);
        const metaDataArray = EavEntity.createArray(item.Metadata);
        const settings = EavAttributes.getFromEavEntityArray(metaDataArray);

        return new ContentTypeDef(item.Id, item.Name, item.Scope, item.Description, attributeDefArray, metaDataArray, settings);
    }
}
