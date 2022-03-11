import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { EditInfo } from '../../shared/models/edit-info';
import { InputType } from './input-type.model';

export interface Field {
  AttributeId: number;
  EditInfo: EditInfo;
  HasFormulas: boolean;
  Id: number;
  InputType: string;
  InputTypeConfig: InputType;
  IsEphemeral: boolean;
  IsTitle: boolean;
  Metadata: FieldMetadata;
  Permissions: PermissionsCount;
  SortOrder: number;
  StaticName: string;
  Type: string;
}

export interface FieldMetadata {
  All: Record<string, any>;
  [key: string]: Record<string, any>;
  /** Merged metadata from other keys */
  merged: Record<string, any>;
}

export interface FieldInputTypeOption {
  dataType: string;
  description: string;
  icon?: string;
  inputType: string;
  isDefault?: boolean;
  isObsolete?: boolean;
  isRecommended?: boolean;
  label: string;
  obsoleteMessage?: string;
}
