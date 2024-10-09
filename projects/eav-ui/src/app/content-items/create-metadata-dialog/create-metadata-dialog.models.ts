import { Of } from '../../../../../core';
import { ContentType } from '../../app-administration/models';
import { MetadataKeyTypes, ScopeOption } from '../../shared/constants/eav.constants';
import { ContentItem } from '../models/content-item.model';

export interface MetadataInfo {
  key: string;
  keyType: Of<typeof MetadataKeyTypes>;
  target?: string;
  targetType: number;
}

export interface TargetTypeOption {
  keyType: Of<typeof MetadataKeyTypes>;
  label: string;
  targetType: number;
  target: string;
  hint?: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: Of<typeof MetadataKeyTypes>;
  contentTypeForContentItems: string;
  scopeForContentTypes: string;
  key: string | number;
}

export interface MetadataDialogViewModel {
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
