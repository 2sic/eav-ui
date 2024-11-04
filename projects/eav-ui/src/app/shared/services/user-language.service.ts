import { Injectable } from '@angular/core';
import { languageLabels, languageUi } from '../constants/session.constants';
import { StateManagerLocal } from '../user/state-manager';

const storeKey = 'user-language';

@Injectable({ providedIn: 'root' }) // TODO: MAYBE don't use root. probably get with transient - 2dm must review this before we finalize
export class UserLanguageService {

  constructor() { }

  #stateManager = new StateManagerLocal(storeKey);

  /**
   * Get the preferred label language - either specified by the opening URL or from the session.
   * @returns The language or null/empty string.
   */
  getLabel(): string {
    return sessionStorage.getItem(languageLabels) ?? this.getLabelStored();
  }

  getLabelStored(): string {
    return this.#stateManager.get('labels');
  }

  setLabel(language: string) {
    this.#stateManager.add('labels', language);
  }

  getUi(): string {
    return sessionStorage.getItem(languageUi) ?? this.getUiStored();
  }

  getUiStored(): string {
    return this.#stateManager.get('ui');
  }

  setUi(language: string) {
    this.#stateManager.add('ui', language);
  }
}
