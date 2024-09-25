import { Of } from '../../core';
import { TranslationLinks } from './translation-link.constants';

export interface TranslationStateCore {
  linkType: Of<typeof TranslationLinks>;
  language: string;
}

export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}
