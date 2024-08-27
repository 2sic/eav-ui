import { Injectable } from '@angular/core';
import { Language } from '../../../../shared/models/language.model';
import { SignalStoreBase } from '../signal-store-base';

const logThis = false;
const nameOfThis = 'LanguageService';

@Injectable({ providedIn: 'root' })
export class LanguageService extends SignalStoreBase<string, Language> {

  constructor() {
    super({ nameOfThis, logThis });
  }

  override getId = (item: Language) => item.NameId.toLocaleLowerCase();

}
