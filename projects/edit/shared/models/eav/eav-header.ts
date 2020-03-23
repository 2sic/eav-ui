import { JsonHeader1 } from '../json-format-v1/json-header1';
import { EavGroupAssignment } from './eav-group-assignment';
import { EavEntity } from './eav-entity';

export class EavHeader {
  v: number;
  entityId: number;
  guid: string;
  contentTypeName: string;
  metadata: EavEntity[];
  group: EavGroupAssignment;
  prefill: any;
  title: string;
  duplicateEntity: number;

  constructor(
    v: number,
    entityId: number,
    guid: string,
    contentTypeName: string,
    metadata: EavEntity[],
    group: EavGroupAssignment,
    prefill: any,
    title: string,
    duplicateEntity: number,
  ) {
    this.v = v;
    this.entityId = entityId;
    this.guid = guid;
    this.contentTypeName = contentTypeName;
    this.metadata = metadata;
    this.group = group;
    this.prefill = prefill;
    this.title = title;
    this.duplicateEntity = duplicateEntity;
  }

  /** Create Eav Header from typed json JsonHeader1 */
  public static create(item: JsonHeader1): EavHeader {
    const metadataArray = EavEntity.createArray(item.Metadata);
    const eavGroupAssignment = EavGroupAssignment.create(item.Group);
    return new EavHeader(1, item.EntityId, item.Guid, item.ContentTypeName, metadataArray, eavGroupAssignment,
      item.Prefill, item.Title, item.DuplicateEntity);
  }
}
