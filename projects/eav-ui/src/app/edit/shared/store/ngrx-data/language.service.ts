import { Injectable, signal, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable, of } from 'rxjs';
import { BaseDataService } from '.';
import { Language } from '../../../../shared/models/language.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class LanguageService /* extends BaseDataService<Language> Old Code */ {

  languages: Record<string, Language> = {};

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('Language', serviceElementsFactory);
  // }

  loadLanguages(languages: Language[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addAllToCache(languages);
    languages.forEach(lang => {
      this.languages[lang.NameId.toLocaleLowerCase()] = lang;
    });

  }

  getLanguages(): Language[] {
    return Object.values(this.languages);
    // return this.cache(); // old code
  }

  // TODO:: Remove after getLanguages$ are remove and use getLanguagesSig
  getLanguages$(): Observable<Language[]> {
    return of(Object.values(this.languages));
    // return this.cache$.asObservable(); // Old Code
  }

  getLanguagesSig(): Signal<Language[]> {
    return signal(Object.values(this.languages));
    // return this.cache(); // old code
  }

  clearCache(): void {
    this.languages = {};
  }

}
