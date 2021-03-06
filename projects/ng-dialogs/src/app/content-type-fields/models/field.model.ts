import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { Dictionary } from '../../shared/models/dictionary.model';
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
  All: Dictionary;
  [key: string]: Dictionary;
  /** Merged metadata from other keys */
  merged: Dictionary;
}

export class FieldInputTypeOption {
  dataType: string;
  inputType: string;
  label: string;
  description: string;
}
