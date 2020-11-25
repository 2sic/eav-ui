import { EavAttributes } from '../../../shared/models/eav';

export interface TranslateMenuDialogData {
  formId: number;
  linkType: string;
  language: string;
  defaultLanguage?: string;
  attributes?: EavAttributes;
  attributeKey?: string;
}
