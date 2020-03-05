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

export class NewField {
  Id = 0;
  Type = 'String';
  InputType = 'string-default';
  StaticName = '';

  constructor(public AppId: number, public ContentTypeId: number, public IsTitle: boolean, public SortOrder: number) { }
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

export class FieldInputTypeConfig { // spm TODO: see whether this type exists in edit form project
  Type: string;
  Label: string;
  Description: string;
  Assets: string;
  DisableI18n: boolean;
  AngularAssets: string;
  AngularMode: string;
  UseAdam: boolean;
}

export class FieldInputTypeOption {
  dataType: string;
  inputType: string;
  label: string;
  description: string;
}
