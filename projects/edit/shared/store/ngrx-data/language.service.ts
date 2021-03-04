import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { BaseDataService } from '.';
import { Language } from '../../models';

@Injectable({ providedIn: 'root' })
export class LanguageService extends BaseDataService<Language> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);
  }

  loadLanguages(languages: Language[]): void {
    this.addAllToCache(languages);
  }

  getLanguages(): Language[] {
    return this.cache$.value;
  }

  getLanguages$(): Observable<Language[]> {
    return this.cache$.asObservable();
  }
}
