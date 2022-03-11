import { ContentType } from '../../app-administration/models';
import { MetadataKeyType, ScopeOption } from '../../shared/constants/eav.constants';
import { ContentItem } from '../models/content-item.model';

export interface MetadataInfo {
  key: string;
  keyType: MetadataKeyType;
  target?: string;
  targetType: number;
}

export interface TargetTypeOption {
  keyType: MetadataKeyType;
  label: string;
  targetType: number;
  target: string;
  hint?: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: MetadataKeyType;
  contentTypeForContentItems: string;
  scopeForContentTypes: string;
  key: string | number;
}

export interface MetadataDialogTemplateVars {
  guidedMode: boolean;
  unknownTargetType: boolean;
  targetTypeHint?: string;
  keyTypeOptions: string[];
  scopeOptions: ScopeOption[];
  guidedKey: boolean;
  guidedKeyExists: boolean;
  formValues: MetadataFormValues;
  contentItems: ContentItem[];
  contentTypes: ContentType[];
}
