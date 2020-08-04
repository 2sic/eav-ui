export class Field {
  Id: number;
  SortOrder: number;
  Type: string;
  InputType: string;
  StaticName: string;
  IsTitle: boolean;
  AttributeId: number;
  Metadata: FieldMetadata;
  InputTypeConfig: FieldInputTypeConfig;
  I18nKey: string;
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
