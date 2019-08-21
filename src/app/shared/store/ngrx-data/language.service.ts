import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Language } from '../../models/eav';

@Injectable({ providedIn: 'root' })
export class LanguageServiceData extends EntityCollectionServiceBase<Language> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);
  }

  /** Load available languages */
  public loadLanguages(languages: Language[]) {
    this.addAllToCache(languages);
  }
}
