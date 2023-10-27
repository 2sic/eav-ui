import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { EavType } from '../../edit/shared/models/eav/eav-type';
import { EditInfo } from '../../shared/models/edit-info';
import { InputTypeStrict } from '../constants/input-type.constants';
import { InputType } from './input-type.model';

export interface Field {
  AttributeId: number;
  EditInfo: EditInfo;
  HasFormulas: boolean;
  Id: number;
  InputType: InputTypeStrict;
  InputTypeConfig: InputType;
  IsEphemeral: boolean;
  IsTitle: boolean;
  Metadata: FieldMetadata;
  Permissions: PermissionsCount;
  SortOrder: number;
  StaticName: string;
  Type: string;

  /** new #SharedFieldDefinition */
  Guid?: string;
  SysSettings: FieldSysSettings;
  /**
   * This will only be available when calling fields/GetSharedFields
   */
  ContentType?: EavType;
}

/** #SharedFieldDefinition */
export interface FieldSysSettings {
  /** Determines if this field is shared / available for others */
  Share: boolean;

  /** WIP, don't use yet */
  Inherit?: string;
  InheritMetadataOf?: string;
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
  inputType: InputTypeStrict;
  isDefault?: boolean;
  isObsolete?: boolean;
  isRecommended?: boolean;
  label: string;
  obsoleteMessage?: string;
}
