import { ContentType } from '../../app-administration/models';
import { MetadataKeyType } from '../../shared/constants/eav.constants';
import { ContentItem } from '../models/content-item.model';

export interface MetadataInfo {
  key: string;
  keyType: MetadataKeyType;
  target: string;
}

export interface TargetTypeOption {
  keyType: MetadataKeyType;
  label: string;
  type: number;
  target: string;
  hint?: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: MetadataKeyType;
  contentTypeForContentItems: string;
  key: string | number;
}

export interface MetadataDialogTemplateVars {
  guidedMode: boolean;
  unknownTargetType: boolean;
  targetTypeHint?: string;
  keyTypeOptions: string[];
  guidedKey: boolean;
  guidedKeyExists: boolean;
  formValues: MetadataFormValues;
  contentItems: ContentItem[];
  contentTypes: ContentType[];
}
