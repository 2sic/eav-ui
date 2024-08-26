import { computed, Injectable, signal, Signal } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { Language } from '../../../../shared/models/language.model';

@Injectable({ providedIn: 'root' })
export class LanguageService /* extends BaseDataService<Language> Old Code */ {

  #languages = signal<Record<string, Language>>({});

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('Language', serviceElementsFactory);
  // }

  loadLanguages(languages: Language[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addAllToCache(languages);

    const currentStatus = this.#languages();

    const updatedStatus = { ...currentStatus };

    languages.forEach(lang => {
      updatedStatus[lang.NameId.toLocaleLowerCase()] = lang;
    });

    this.#languages.set(updatedStatus);
  }

  getLanguages(): Language[] {
    return Object.values(this.#languages());
    // return this.cache(); // old code
  }

  // TODO:: @2dg Question, i will use new getLanguagesSig
  // getLanguages$(): Observable<Language[]> {
  //   const lang = computed(() => this.getLanguages());
  //   return of(lang());  // only give one value, not a update, remove the fn and use the new signal
  //   // return this.cache$.asObservable(); // Old Code
  // }

  getLanguagesSig(): Signal<Language[]> {
    return computed(() => this.getLanguages());
    // return this.cache(); // old code
  }

  clearCache(): void {
    this.#languages.set({});
  }

}
