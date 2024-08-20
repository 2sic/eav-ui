import { Language } from '../../shared/models/language.model';

export { Language } from '../../shared/models/language.model';

export class FormLanguage
{
  /** The current language of the system / UI. */
  current: string;

  /** The primary language of the system.
   * Important, because the primary language must be filled in before all other languages.
   */
  primary: string;

  /**
   * In some cases we want both to be primary, but it's not clear why.
   * I think it's just because we want certain tests to only use one value, but the test is meant for 2 values.
   */
  static bothPrimary(original: FormLanguage): FormLanguage {
    return {
      current: original.primary,
      primary: original.primary
    };
  }

  static diffCurrent(original: FormLanguage, current: string): FormLanguage {
    return {
      current: current,
      primary: original.primary
    };
  }

  static empty(): FormLanguageComplete {
    return {
      current: '',
      primary: '',
      initial: '',
    };
  }
}

export class FormLanguageComplete extends FormLanguage {
  /** initial language of the UI */
  initial: string;
}

export interface FormLanguagesConfig
{
  initial: string;
  primary: string;
  list: Language[];
}

