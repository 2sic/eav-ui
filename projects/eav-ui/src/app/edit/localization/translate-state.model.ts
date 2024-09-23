import { TranslationLink } from './translation-link.constants';

export interface TranslationStateCore {
  linkType: TranslationLink;
  language: string;
}

export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}

