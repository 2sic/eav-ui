import { PermissionsCount } from '../../app-administration/models/permissions-count.model';

export class Field {
  AttributeId: number;
  Id: number;
  InputType: string;
  InputTypeConfig: FieldInputTypeConfig;
  IsTitle: boolean;
  Metadata: FieldMetadata;
  Permissions: PermissionsCount;
  SortOrder: number;
  StaticName: string;
  Type: string;
}

export class FieldMetadata {
  All: FieldMetadataKey;
  [key: string]: FieldMetadataKey;
  /** Merged metadata from other keys */
  merged: FieldMetadataKey;
}

export class FieldMetadataKey {
  [key: string]: any;
}

export class FieldInputTypeConfig {
  Type: string;
  Label: string;
  Description: string;
  Assets: string;
  DisableI18n: boolean;
  AngularAssets: string;
  UseAdam: boolean;
}

export class FieldInputTypeOption {
  dataType: string;
  inputType: string;
  label: string;
  description: string;
}
