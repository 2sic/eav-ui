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
    const fromUrl = sessionStorage.getItem(languageLabels);
    if (fromUrl?.endsWith('!'))
      return fromUrl.slice(0, -1);
    return this.getLabelStored() ?? fromUrl;
  }

  /** Get label as stored - for the config UI */
  getLabelStored(): string {
    return this.#stateManager.get('labels');
  }

  /** Set the label in the store */
  setLabel(language: string) {
    this.#stateManager.add('labels', language);
  }

  /** Get the UI mixing url, stored etc. */
  getUi(fallback?: string): string {
    // Check if URL overrides everything
    const fromUrl = sessionStorage.getItem(languageUi);
    if (fromUrl?.endsWith('!'))
      return fromUrl.slice(0, -1);
    return this.getUiStored() ?? fromUrl ?? fallback;
  }

  /** Get the code like 'en' or 'de' for setting the language */
  getUiCode(fallback?: string): string {
    return this.getUi(fallback)?.toLocaleLowerCase().split('-')[0];
  }

  /** Get the UI as stored, for the config-UI */
  getUiStored(): string {
    return this.#stateManager.get('ui');
  }

  /** Set the UI language in the store */
  setUi(language: string) {
    this.#stateManager.add('ui', language);
  }
}
