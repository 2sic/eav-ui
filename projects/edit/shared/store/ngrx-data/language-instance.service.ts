import { Injectable, OnDestroy } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LanguageInstance } from '../../models/eav/language-instance';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends EntityCollectionServiceBase<LanguageInstance> implements OnDestroy {
  private localizationWrapperMenuChangeSource = new Subject<string>();
  localizationWrapperMenuChange$ = this.localizationWrapperMenuChangeSource.asObservable();

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('LanguageInstance', serviceElementsFactory);
  }

  ngOnDestroy() {
    this.localizationWrapperMenuChangeSource.complete();
  }

  /** Add language instance to ngrx-data */
  addLanguageInstance(formId: number, currentLanguage: string, defaultLanguage: string, uiLanguage: string, hideHeader: boolean) {
    const languageInstance: LanguageInstance = { formId, currentLanguage, defaultLanguage, uiLanguage, hideHeader };
    this.addOneToCache(languageInstance);
  }

  /** Get current language observable for the form with given formId */
  getCurrentLanguage(formId: number) {
    return this.entities$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.currentLanguage),
      distinctUntilChanged((oldLang, newLang) => oldLang === newLang),
    );
  }

  /** Get default language observable for the form with given formId */
  getDefaultLanguage(formId: number) {
    return this.entities$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.defaultLanguage),
      distinctUntilChanged((oldLang, newLang) => oldLang === newLang),
    );
  }

  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeader(formId: number) {
    return this.entities$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.hideHeader),
      distinctUntilChanged((oldHide, newHide) => oldHide === newHide),
    );
  }

  /** Updated currentLanguage for a form with given formId. If form with given id isn't found, nothing is updated */
  updateCurrentLanguage(formId: number, newLanguage: string) {
    const languageInstance: Partial<LanguageInstance> = { formId, currentLanguage: newLanguage };
    this.updateOneInCache(languageInstance);
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean) {
    const languageInstance: Partial<LanguageInstance> = { formId, hideHeader };
    this.updateOneInCache(languageInstance);
  }

  removeLanguageInstance(formId: number) {
    this.removeOneFromCache(formId);
  }

  /** Trigger info message change on all form controls */
  triggerLocalizationWrapperMenuChange() {
    this.localizationWrapperMenuChangeSource.next();
  }
}
