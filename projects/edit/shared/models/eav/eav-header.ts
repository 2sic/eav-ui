import { EavEntity, EavFor, EavGroupAssignment } from '.';
import { ObjectModel } from '..';

export interface EavHeader {
  Add: boolean;
  ContentTypeName: string;
  DuplicateEntity: number;
  EntityId: number;
  For: EavFor;
  Group: EavGroupAssignment;
  Guid: string;
  Index: number;
  Metadata: EavEntity[];
  Prefill: ObjectModel<any>;
  Title: string;
}
