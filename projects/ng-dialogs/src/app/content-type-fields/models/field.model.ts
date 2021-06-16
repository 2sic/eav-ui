import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { InputType } from './input-type.model';

export interface Field {
  AttributeId: number;
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
  inputType: string;
  label: string;
  description: string;
}
