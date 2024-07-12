import { FormLanguage, FormLanguageComplete } from './form-languages.model';

export interface FormLanguageInStore extends FormLanguageComplete {
  formId: number;
  hideHeader: boolean;
}
