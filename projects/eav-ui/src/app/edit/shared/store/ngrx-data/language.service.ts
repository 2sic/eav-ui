import { computed, Injectable, signal, Signal } from '@angular/core';
import { Language } from '../../../../shared/models/language.model';

@Injectable({ providedIn: 'root' })
export class LanguageService /* extends BaseDataService<Language> Old Code */ {

  /** Main signal using the key to keep things unique */
  #languages = signal<Record<string, Language>>({});

  /** Cached version of the signal, with the latest object-values */
  #languagesArray = computed(() => Object.values(this.#languages()));

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('Language', serviceElementsFactory);
  // }

  // #region Add / Clear Cache

  loadLanguages(languages: Language[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addAllToCache(languages);

    const updatedStatus = { ...this.#languages() };

    languages.forEach(lang => {
      updatedStatus[lang.NameId.toLocaleLowerCase()] = lang;
    });

    this.#languages.set(updatedStatus);
  }

  clearCache(): void {
    this.#languages.set({});
  }

  // #endregion

  // #region Getters

  getLanguages(): Language[] {
    return this.#languagesArray();  // use shared / calculated signal
    // return Object.values(this.#languages());
    // return this.cache(); // old code
  }

  // TODO:: @2dg Question, i will use new getLanguagesSig
  // getLanguages$(): Observable<Language[]> {
  //   const lang = computed(() => this.getLanguages());
  //   return of(lang());  // only give one value, not a update, remove the fn and use the new signal
  //   // return this.cache$.asObservable(); // Old Code
  // }

  getLanguagesSignal(): Signal<Language[]> {
    return this.#languagesArray;
  }

  //#endregion

}
