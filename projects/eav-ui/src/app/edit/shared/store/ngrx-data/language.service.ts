import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { BaseDataService } from '.';
import { Language } from '../../../../shared/models/language.model';

@Injectable({ providedIn: 'root' })
export class LanguageService extends BaseDataService<Language> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);
  }

  loadLanguages(languages: Language[]): void {
    this.addAllToCache(languages);
  }

  getLanguages(): Language[] {
    return this.cache();
  }

  getLanguages$(): Observable<Language[]> {
    return this.cache$.asObservable();
  }
}
