import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { InputType, InputTypeNew } from './input-type.model';

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

// TODO: sync with the InputType interface, we probably just need one after renaming fields
export interface FieldInputTypeOption extends InputTypeNew {
  dataType: string;
  inputType: string;
  label: string;
  description: string;

  /** The icon to show, based on recommended / default */
  Icon?: string;
}
