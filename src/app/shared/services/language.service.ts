import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as languageActions from '../../shared/store/actions/language.actions';
import * as fromStore from '../store';
import { Language } from '../models/eav';

@Injectable()
export class LanguageService {

  constructor(private httpClient: HttpClient, private store: Store<fromStore.EavState>) {
    // this.items$ = store.select(fromStore.getItems);
  }

  /**
   * Load all languages
   */
  public loadLanguages() {
    // TODO: read from service
    const languages: Language[] = [
      { key: 'en-us', name: 'English' },
      { key: 'de-de', name: 'German' },
      { key: 'fr-fr', name: 'French' },
      { key: 'hr-hr', name: 'Croatian' },
    ];

    this.store.dispatch(new languageActions.LoadLanguagesAction(languages, 'de-de', 'en-us', 'en-us'));
  }

  public selectAllLanguages(): Observable<Language[]> {
    return this.store.select(fromStore.getLanguages);
  }

  public selectLanguage(name: string) {
    return this.store.select(fromStore.getLanguages)
      .map(data => data.find(obj => obj.name === name));
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
}
