import { EavEntity, EavFor } from '.';
import { EditInfo } from '../../../../shared/models/edit-info';

export interface EavHeader {
  Add?: boolean | null;
  ContentTypeName: string;
  DuplicateEntity: number | null;
  EditInfo: EditInfo | null;
  EntityId: number;
  For: EavFor | null;
  // 2022-09-19 2dm - WIP, part of #cleanUpDuplicateGroupHeaders
  // Group: EavGroupAssignment | null;
  Guid: string;
  Index: number | null;
  Metadata?: EavEntity[];
  Prefill: Record<string, any> | null;
  Title?: string;

  // 2022-09-19 2dm - WIP, part of #cleanUpDuplicateGroupHeaders
  IsEmpty: boolean;
  IsEmptyAllowed: boolean;
}
