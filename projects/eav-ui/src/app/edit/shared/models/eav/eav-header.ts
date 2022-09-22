import { EavEntity, EavFor } from '.';
import { EditInfo } from '../../../../shared/models/edit-info';

export interface EavHeader {
  Add?: boolean | null;
  ContentTypeName: string;
  DuplicateEntity: number | null;
  EditInfo: EditInfo | null;
  EntityId: number;
  For: EavFor | null;
  Guid: string;
  Index: number | null;
  Metadata?: EavEntity[];
  Prefill: Record<string, any> | null;
  Title?: string;

  IsEmpty: boolean;
  IsEmptyAllowed: boolean;
}
