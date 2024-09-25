import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { Of } from '../../core';
import { EavType } from '../../edit/shared/models/eav/eav-type';
import { EditInfo } from '../models/edit-info';
import { InputTypeCatalog } from './input-type-catalog';
import { InputTypeMetadata } from './input-type-metadata.model';

export interface Field {
  AttributeId: number;
  EditInfo: EditInfo;
  HasFormulas: boolean;
  Id: number;
  InputType: Of<typeof InputTypeCatalog>;
  InputTypeConfig: InputTypeMetadata;
  IsEphemeral: boolean;
  IsTitle: boolean;
  Metadata: FieldMetadata;
  Permissions: PermissionsCount;
  SortOrder: number;
  StaticName: string;
  Type: string;

  /** new #SharedFieldDefinition v16.08 */
  Guid?: string;
  SysSettings: FieldSysSettings;
  /**
   * This will only be available when calling fields/GetSharedFields
   */
  ContentType?: EavType;

  /** new #ConfigTypesFromBackend v16.08 */
  ConfigTypes: Record<string, boolean>;

  /** WIP v18 with imageconfiguration on links and wysiwyg */
  imageConfiguration: {
    isRecommended: boolean;
    typeName: string;
    entityId: number;
  };
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
  inputType: Of<typeof InputTypeCatalog>;
  isDefault?: boolean;
  isObsolete?: boolean;
  isRecommended?: boolean;
  label: string;
  obsoleteMessage?: string;
}
