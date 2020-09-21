// import { JsonHeader1 } from '../json-format-v1/json-header1';
import { EavEntity } from './eav-entity';
import { EavGroupAssignment } from './eav-group-assignment';

export class EavHeader {
  V: number;
  EntityId: number;
  Guid: string;
  ContentTypeName: string;
  Metadata: EavEntity[];
  Group: EavGroupAssignment;
  Prefill: any;
  Title: string;
  DuplicateEntity: number;

  // constructor(
  //   v: number,
  //   entityId: number,
  //   guid: string,
  //   contentTypeName: string,
  //   metadata: EavEntity[],
  //   group: EavGroupAssignment,
  //   prefill: any,
  //   title: string,
  //   duplicateEntity: number,
  // ) {
  //   this.V = v;
  //   this.EntityId = entityId;
  //   this.Guid = guid;
  //   this.ContentTypeName = contentTypeName;
  //   this.Metadata = metadata;
  //   this.Group = group;
  //   this.Prefill = prefill;
  //   this.Title = title;
  //   this.DuplicateEntity = duplicateEntity;
  // }

  /** Create Eav Header from typed json JsonHeader1 */
  // public static create(item: EavHeader /* JsonHeader1 */): EavHeader {
  //   const metadataArray = EavEntity.createArray(item.Metadata);
  //   const eavGroupAssignment = EavGroupAssignment.create(item.Group);
  //   const header: EavHeader = { V: 1, ...item, Group: eavGroupAssignment, Metadata: metadataArray };
  //   return header;
  // }
}
