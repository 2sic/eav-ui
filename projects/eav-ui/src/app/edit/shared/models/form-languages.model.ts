import { Language } from '.';

export interface FormLanguage
{
  current: string;
  primary: string;
}

export interface FormLanguagesConfig
{
  current: string;
  primary: string;
  list: Language[];
}