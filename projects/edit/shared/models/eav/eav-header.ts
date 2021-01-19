import { EavEntity, EavFor } from '.';
import { EavGroupAssignment } from './eav-group-assignment';

export class EavHeader {
  Add: boolean;
  ContentTypeName: string;
  DuplicateEntity: number;
  EntityId: number;
  For: EavFor;
  Group: EavGroupAssignment;
  Guid: string;
  Index: number;
  Metadata: EavEntity[];
  Prefill: { [key: string]: any };
  Title: string;
}
