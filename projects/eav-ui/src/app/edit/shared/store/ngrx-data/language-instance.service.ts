import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';
import { EntityReader } from '../../helpers';
import { FormLanguageInStore } from '../../models';
import { BaseDataService } from './base-data.service';
import { FormLanguage } from '../../models/form-languages.model';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends BaseDataService<FormLanguageInStore> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('FormLanguageInStore', serviceElementsFactory);
  }

  addToStore(formId: number, currentLanguage: string, defaultLanguage: string, hideHeader: boolean): void {
    this.addOneToCache({
      formId,
      current: currentLanguage,
      primary: defaultLanguage,
      hideHeader,
    } satisfies FormLanguageInStore);
  }

  removeFromStore(formId: number): void {
    this.removeOneFromCache(formId);
  }

  setCurrent(formId: number, newLanguage: string): void {
    this.updateOneInCache({
      formId,
      current: newLanguage,
    } satisfies Partial<FormLanguageInStore>);
  }

  // TODO: @2dm - get rid of this, use a getLanguage() instead

  getLanguage(formId: number): FormLanguage {
    const found = this.cache$.value.find(languageInstance => languageInstance.formId === formId);
    return {
      current: found?.current,
      primary: found?.primary,
    } satisfies FormLanguage;
  }

  getCurrent(formId: number): string {
    return this.cache$.value.find(languageInstance => languageInstance.formId === formId)?.current;
  }

  getPrimary(formId: number): string {
    return this.cache$.value.find(languageInstance => languageInstance.formId === formId)?.primary;
  }

  /**
   * Get an EntityReader for the current form
   */
  getEntityReader$(formId: number) {
    return this.getLanguage$(formId)
    .pipe(
      map((language) => new EntityReader(language.current, language.primary)),
      // Ensure we don't fire too often
      distinctUntilChanged(),
      // Ensure the EntityReader is reused and not recreated every time
      shareReplay(1)
    );
  }

  getLanguage$(formId: number): Observable<FormLanguage> {
    if (this.get$Cache[formId]) 
      return this.get$Cache[formId];

    return this.get$Cache[formId] = this.cache$.pipe(
      map(languageInstances => {
        const found = languageInstances.find(l => l.formId === formId);
        return {
          current: found?.current,
          primary: found?.primary,
        } satisfies FormLanguage;
      }),
      distinctUntilChanged(),
      // Ensure the EntityReader is reused and not recreated every time
      // todo: this probably doesn't have a real effect...
      shareReplay(1)
    );
  }
  private get$Cache: Record<number, Observable<FormLanguage>> = {};


  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeader$(formId: number): Observable<boolean> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.hideHeader),
      distinctUntilChanged(),
    );
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    const languageInstance: Partial<FormLanguageInStore> = { formId, hideHeader };
    this.updateOneInCache(languageInstance);
  }
}
