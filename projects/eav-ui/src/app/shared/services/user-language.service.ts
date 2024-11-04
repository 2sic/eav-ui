import { Injectable } from '@angular/core';
import { StateManagerLocal } from '../user/state-manager';

const storeKey = 'user-language';

@Injectable({ providedIn: 'root' }) // TODO: don't use root. get with transient
export class UserLanguageService {

  private localStateManager: StateManagerLocal;

  constructor() {
    this.localStateManager = new StateManagerLocal(storeKey);
  }

  getLabelLanguage(): string {
    return this.localStateManager.get('label-lang');
  }

  setLabelLanguage(language: string) {
    this.localStateManager.add('label-lang', language);
  }

  getUiLanguage(): string {
    return this.localStateManager.get('ui-lang');
  }

  setUiLanguage(language: string) {
    this.localStateManager.add('ui-lang', language);
  }
}
