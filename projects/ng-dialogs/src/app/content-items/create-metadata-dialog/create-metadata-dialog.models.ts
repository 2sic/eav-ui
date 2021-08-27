import { ContentType } from '../../app-administration/models';
import { ContentItem } from '../models/content-item.model';

export interface MetadataInfo {
  key: string;
  keyType: string;
  target: string;
}

export interface TargetTypeOption {
  keyType: string | undefined;
  label: string;
  type: number;
  target: string;
  hint?: string;
}

export interface MetadataFormValues {
  targetType: number;
  keyType: string;
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
