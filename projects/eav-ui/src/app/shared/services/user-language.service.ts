import { Injectable } from '@angular/core';
import { StateManagerLocal } from '../user/state-manager';

const storeKey = 'user-language';

@Injectable({ providedIn: 'root' }) // TODO: MAYBE don't use root. probably get with transient - 2dm must review this before we finalize
export class UserLanguageService {

  constructor() { }

  #stateManager = new StateManagerLocal(storeKey);

  getLabelLanguage(): string {
    return this.#stateManager.get('labels');
  }

  setLabelLanguage(language: string) {
    this.#stateManager.add('labels', language);
  }

  getUiLanguage(): string {
    return this.#stateManager.get('ui');
  }

  setUiLanguage(language: string) {
    this.#stateManager.add('ui', language);
  }
}
