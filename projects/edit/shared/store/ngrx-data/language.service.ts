import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Language } from '../../models/eav';

@Injectable({ providedIn: 'root' })
export class LanguageService extends EntityCollectionServiceBase<Language> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);
  }

  /** Load available languages in ngrx-data */
  loadLanguages(languages: Language[]) {
    this.addAllToCache(languages);
  }
}
