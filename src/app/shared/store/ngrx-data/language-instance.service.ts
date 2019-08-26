import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Subject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { LanguageInstance } from '../../models/eav/language-instance';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends EntityCollectionServiceBase<LanguageInstance> {
  private localizationWrapperMenuChangeSource = new Subject<string>();
  public localizationWrapperMenuChange$ = this.localizationWrapperMenuChangeSource.asObservable();

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('LanguageInstance', serviceElementsFactory);
  }

  /** Add language instance to ngrx-data */
  public addLanguageInstance(formId: number, currentLanguage: string, defaultLanguage: string, uiLanguage: string) {
    const languageInstance: LanguageInstance = { formId, currentLanguage, defaultLanguage, uiLanguage };
    this.addOneToCache(languageInstance);
  }

  /** Get current language observable for the form with given formId */
  public getCurrentLanguage(formId: number) {
    return this.entities$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId).currentLanguage),
      distinctUntilChanged((oldLang, newLang) => oldLang === newLang),
    );
  }

  /** Get default language observable for the form with given formId */
  public getDefaultLanguage(formId: number) {
    return this.entities$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId).defaultLanguage),
      distinctUntilChanged((oldLang, newLang) => oldLang === newLang),
    );
  }

  /** Updated currentLanguage for a form with given formId. If form with given id isn't found, nothing is updated */
  public updateCurrentLanguage(formId: number, newLanguage: string) {
    const languageInstance: Partial<LanguageInstance> = { formId, currentLanguage: newLanguage };
    this.updateOneInCache(languageInstance);
  }

  public removeLanguageInstance(formId: number) {
    this.removeOneFromCache(formId);
  }

  /** Trigger info message change on all form controls */
  public triggerLocalizationWrapperMenuChange() {
    this.localizationWrapperMenuChangeSource.next();
  }
}
