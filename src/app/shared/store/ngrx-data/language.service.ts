import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Subject } from 'rxjs';

import { Language } from '../../models/eav';
import * as languageActions from '../../store/actions/language.actions';
import * as fromStore from '../../store';

@Injectable({ providedIn: 'root' })
export class LanguageService extends EntityCollectionServiceBase<Language> {
  private localizationWrapperMenuChangeSource = new Subject<string>();
  public localizationWrapperMenuChange$ = this.localizationWrapperMenuChangeSource.asObservable();

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Language', serviceElementsFactory);
  }

  /** Load available languages in ngrx-data */
  public loadLanguages(languages: Language[]) {
    this.addAllToCache(languages);
  }

  // Non ngrx-data services

  /** Load currently in use language keys */
  public loadCurrentLanguages(currentLanguage: string, defaultLanguage: string, uiLanguage: string) {
    this.store.dispatch(new languageActions.LoadLanguagesAction(currentLanguage, defaultLanguage, uiLanguage));
  }

  public getCurrentLanguage() {
    return this.store.select(fromStore.getCurrentLanguage);
  }

  public getDefaultLanguage() {
    return this.store.select(fromStore.getDefaultLanguage);
  }

  public updateCurrentLanguage(currentLanguage: string) {
    this.store.dispatch(new languageActions.UpdateCurrentLanguageAction(currentLanguage));
  }

  public updateDefaultLanguage(defaultLanguage: string) {
    this.store.dispatch(new languageActions.UpdateDefaultLanguageAction(defaultLanguage));
  }

  /** Trigger info message change on all form controls */
  public triggerLocalizationWrapperMenuChange() {
    this.localizationWrapperMenuChangeSource.next();
  }
}
