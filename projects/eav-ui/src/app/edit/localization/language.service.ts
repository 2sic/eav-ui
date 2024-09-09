import { Injectable } from '@angular/core';
import { Language } from '../../shared/models/language.model';
import { SignalStoreBase } from '../shared/store/signal-store-base';

const logSpecs = {
  enabled: false,
  name: 'LanguageService',
};

@Injectable({ providedIn: 'root' })
export class LanguageService extends SignalStoreBase<string, Language> {

  constructor() {
    super(logSpecs);
  }

  override getId = (item: Language) => item.NameId.toLocaleLowerCase();

}
