import { EavAttributes } from './eav-attributes';

export interface LinkToOtherLanguageData {
  formId: number;
  linkType: string;
  language: string;
  defaultLanguage?: string;
  attributes?: EavAttributes;
  attributeKey?: string;
}
