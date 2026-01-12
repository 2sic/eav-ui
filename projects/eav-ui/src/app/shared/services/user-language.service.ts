import { Injectable } from '@angular/core';
import { LanguagePart } from '../../edit/dialog/header/language-settings-dialog/LanguageDropdown/language-part.enum';
import { DialogUiSettings, keySettings } from '../constants/session.constants';
import { StateManagerLocal } from '../user/state-manager';

const storeKey = 'user-language';


@Injectable({ providedIn: 'root' })
export class UserLanguageService {

  constructor() { }

  #stateManager = new StateManagerLocal(storeKey);

  /** Get the UI mixing url, stored etc. */
  #config(part: LanguagePart, fallback?: string): { language: string, force: boolean } {
    // Check if URL overrides everything
    const fromUrl = this.#dialogUiSettings()?.[ part == LanguagePart.UI ? 'languageUi' : 'languageForm' ];
    if (fromUrl?.endsWith('!'))
      return { language: fromUrl.slice(0, -1), force: true };
    return { language: this.stored(part) ?? fromUrl ?? fallback, force: false };
  }

  value(part: LanguagePart): string {
    return this.#config(part).language;
  }

  /**
   * Get the UI or Form as stored for the user, for the config-UI
   * Important: can be an empty string! which must be returned as null.
   */
  stored(part: LanguagePart): string {
    return this.#stateManager.get(part) || null;
  }

  /** Set the UI language in the store */
  save(part: LanguagePart, language: string) {
    this.#stateManager.add(part, language || null); // try to save null instead of ""
  }

  /** Get the code like 'en' or 'de' for setting the language */
  uiCode(fallback?: string): string {
    return this.#config(LanguagePart.UI, fallback)?.language?.toLocaleLowerCase().split('-')[0];
  }

  /**
   * Return true/false for the PrimaryTranslatable option.
   * If nothing stored, returns false.
   */
  primaryTranslatableEnabled(): boolean {
    const stored = this.stored(LanguagePart.PrimaryTranslatable);
    if (stored === null || stored === undefined) return false;
    // stored might already be boolean serialized as string 'true'/'false'
    if (typeof stored === 'string') {
      return stored.toLowerCase() === 'true';
    }
    return !!stored;
  }

  /**
   * Save the PrimaryTranslatable boolean flag.
   * Stored as string 'true' or 'false' to keep compatibility with existing StateManagerLocal.
   */
  savePrimaryTranslatable(enabled: boolean) {
    this.save(LanguagePart.PrimaryTranslatable, enabled ? 'true' : 'false');
  }

  isForced(part: LanguagePart): boolean {
    return this.#config(part)?.force;
  }

  userConfigurable(): boolean {
    const isConfigurable = this.#dialogUiSettings()?.languageUserSettings;
    return isConfigurable !== false && isConfigurable !== "false";
  }

  // note: for now just here, if we need it more often
  // create some service which caches the object instead of deserializing every time
  #dialogUiSettings(): DialogUiSettings {
    if (this.#uiSettingsCached)
      return this.#uiSettingsCached;
    const storedMaybeString = sessionStorage.getItem(keySettings);
    return (!storedMaybeString)
      ? null
      : this.#uiSettingsCached = JSON.parse(storedMaybeString);
  }
  #uiSettingsCached?: DialogUiSettings;
}
