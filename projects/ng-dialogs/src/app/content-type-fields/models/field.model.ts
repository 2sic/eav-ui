import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { InputType } from './input-type.model';

export class Field {
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

export class FieldMetadata {
  All: Record<string, any>;
  [key: string]: Record<string, any>;
  /** Merged metadata from other keys */
  merged: Record<string, any>;
}

export class FieldInputTypeOption {
  dataType: string;
  inputType: string;
  label: string;
  description: string;
}
