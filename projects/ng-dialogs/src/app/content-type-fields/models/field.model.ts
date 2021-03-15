import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { ObjectModel } from '../../shared/models/dictionary.model';
import { InputType } from './input-type.model';

export class Field {
  AttributeId: number;
  Id: number;
  InputType: string;
  InputTypeConfig: InputType;
  IsTitle: boolean;
  Metadata: FieldMetadata;
  Permissions: PermissionsCount;
  SortOrder: number;
  StaticName: string;
  Type: string;
}

export class FieldMetadata {
  All: ObjectModel<any>;
  [key: string]: ObjectModel<any>;
  /** Merged metadata from other keys */
  merged: ObjectModel<any>;
}

export class FieldInputTypeOption {
  dataType: string;
  inputType: string;
  label: string;
  description: string;
}
