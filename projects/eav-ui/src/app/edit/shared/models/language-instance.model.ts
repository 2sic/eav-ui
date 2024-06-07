import { FormLanguage } from './form-languages.model';

export interface FormLanguageInStore extends FormLanguage {
  formId: number;
  hideHeader: boolean;
}
