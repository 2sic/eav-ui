import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LanguageInstance } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends BaseDataService<LanguageInstance> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('LanguageInstance', serviceElementsFactory);
  }

  addLanguageInstance(formId: number, currentLanguage: string, defaultLanguage: string, uiLanguage: string, hideHeader: boolean): void {
    const languageInstance: LanguageInstance = { formId, currentLanguage, defaultLanguage, uiLanguage, hideHeader };
    this.addOneToCache(languageInstance);
  }

  removeLanguageInstance(formId: number): void {
    this.removeOneFromCache(formId);
  }

  setCurrentLanguage(formId: number, newLanguage: string): void {
    const languageInstance: Partial<LanguageInstance> = { formId, currentLanguage: newLanguage };
    this.updateOneInCache(languageInstance);
  }

  getCurrentLanguage(formId: number): string {
    return this.cache$.value.find(languageInstance => languageInstance.formId === formId)?.currentLanguage;
  }

  getCurrentLanguage$(formId: number): Observable<string> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.currentLanguage),
      distinctUntilChanged(),
    );
  }

  getDefaultLanguage(formId: number): string {
    return this.cache$.value.find(languageInstance => languageInstance.formId === formId)?.defaultLanguage;
  }

  getDefaultLanguage$(formId: number): Observable<string> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.defaultLanguage),
      distinctUntilChanged(),
    );
  }

  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeader$(formId: number): Observable<boolean> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.hideHeader),
      distinctUntilChanged(),
    );
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    const languageInstance: Partial<LanguageInstance> = { formId, hideHeader };
    this.updateOneInCache(languageInstance);
  }
}
