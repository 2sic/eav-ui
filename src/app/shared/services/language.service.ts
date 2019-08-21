import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import * as languageActions from '../store/actions/language.actions';
import * as fromStore from '../store';

@Injectable()
export class LanguageService {
  private localizationWrapperMenuChangeSource = new Subject<string>();
  public localizationWrapperMenuChange$ = this.localizationWrapperMenuChangeSource.asObservable();

  constructor(private store: Store<fromStore.EavState>) { }

  /**
   * Load all languages
   */
  public loadLanguages(currentLanguage: string, defaultLanguage: string, uiLanguage: string) {
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

  /**
   * Trigger info message change on all form controls
   * @param infoMessage
   */
  public triggerLocalizationWrapperMenuChange() {
    this.localizationWrapperMenuChangeSource.next();
  }
}
