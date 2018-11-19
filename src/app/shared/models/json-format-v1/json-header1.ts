import { GroupAssignment1 } from './group-assignment1';
import { EavHeader } from '../eav/eav-header';
import { Entity1 } from './entity1';

export class JsonHeader1 {
    EntityId: number;
    Guid: string;
    ContentTypeName: string;
    Metadata: Entity1[];
    Group: GroupAssignment1;
    Prefill: any;
    Title: string;
    DuplicateEntity: number;

    constructor(entityId: number,
        guid: string,
        contentTypeName: string,
        metadata: Entity1[],
        group: GroupAssignment1,
        prefill: any,
        title: string,
        duplicateEntity: number) {
        this.EntityId = entityId;
        this.Guid = guid;
        this.ContentTypeName = contentTypeName;
        this.Metadata = metadata;
        this.Group = group;
        this.Prefill = prefill;
        this.Title = title;
        this.DuplicateEntity = duplicateEntity;
    }

    /* public static create(item: JsonHeader1): JsonHeader1 {
        return new JsonHeader1(item.V);
    } */

    public static create(item: EavHeader): JsonHeader1 {
        const metaDataArray = Entity1.createArray(item.metadata);
        const groupAssignment1 = GroupAssignment1.create(item.group);
        return new JsonHeader1(item.entityId, item.guid, item.contentTypeName, metaDataArray, groupAssignment1,
            item.prefill, item.title, item.duplicateEntity);
    }
}
