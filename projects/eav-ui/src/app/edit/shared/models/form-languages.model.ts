import { Language } from '.';
import { of } from 'rxjs';

export class FormLanguage
{
  current: string;
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

  static empty(): FormLanguage {
    return {
      current: '',
      primary: ''
    };
  }
}

export interface FormLanguagesConfig
{
  initial: string;
  primary: string;
  list: Language[];
}