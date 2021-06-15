import { EavEntity, EavFor, EavGroupAssignment } from '.';

export interface EavHeader {
  Add: boolean;
  ContentTypeName: string;
  DuplicateEntity: number;
  EntityId: number;
  For: EavFor;
  Group: EavGroupAssignment;
  Guid: string;
  Index: number;
  Metadata?: EavEntity[];
  Prefill: Record<string, any>;
  Title?: string;
}
