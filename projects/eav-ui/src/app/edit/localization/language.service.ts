import { Injectable } from '@angular/core';
import { classLog } from '../../../../../shared/logging';
import { Language } from '../../shared/models/language.model';
import { SignalStoreBase } from '../shared/store/signal-store-base';

@Injectable({ providedIn: 'root' })
export class LanguageService extends SignalStoreBase<string, Language> {

  constructor() {
    super(classLog({LanguageService}));
  }

  override getId = (item: Language) => item.NameId.toLocaleLowerCase();
}
