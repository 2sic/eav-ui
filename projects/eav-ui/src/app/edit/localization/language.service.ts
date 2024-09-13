import { Injectable } from '@angular/core';
import { Language } from '../../shared/models/language.model';
import { SignalStoreBase } from '../shared/store/signal-store-base';
import { classLog } from '../../shared/logging';

@Injectable({ providedIn: 'root' })
export class LanguageService extends SignalStoreBase<string, Language> {

  log = classLog({LanguageService});
  
  constructor() {
    super();
    this.constructorEnd();
  }

  override getId = (item: Language) => item.NameId.toLocaleLowerCase();

}
