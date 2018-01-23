import { AttributeDef } from './attribute-def';
import { EavEntity } from './eav-entity';
import { ContentTypeDef1 } from '../json-format-v1/content-type-def1';

export class ContentTypeDef {
    id: string;
    name: string;
    scope: string;
    description: string;
    attributes: AttributeDef[];
    metadata: EavEntity[];

    constructor(id: string, name: string, scope: string, description: string, attributes: AttributeDef[], metadata: EavEntity[]) {
        this.id = id;
        this.name = name;
        this.scope = scope;
        this.description = description;
        this.attributes = attributes;
    }

    /**
     * Create ContentTypeDef from json typed ContentType1
     * @param item
     */
    public static create(item: ContentTypeDef1): ContentTypeDef {
        const attributeDefArray = AttributeDef.createArray(item.Attributes);
        const metaDataArray = EavEntity.createArray(item.Metadata);

        return new ContentTypeDef(item.Id, item.Name, item.Scope, item.Description, attributeDefArray, metaDataArray);
    }
}
