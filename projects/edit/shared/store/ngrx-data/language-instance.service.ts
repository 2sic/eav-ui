import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LanguageInstance } from '../../models';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends EntityCollectionServiceBase<LanguageInstance> {
  private languageInstances$: BehaviorSubject<LanguageInstance[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('LanguageInstance', serviceElementsFactory);

    this.languageInstances$ = new BehaviorSubject<LanguageInstance[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(languageInstances => {
      this.languageInstances$.next(languageInstances);
    });
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
    return this.languageInstances$.value.find(instance => instance.formId === formId)?.currentLanguage;
  }

  getCurrentLanguage$(formId: number): Observable<string> {
    return this.languageInstances$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.currentLanguage),
      distinctUntilChanged(),
    );
  }

  getDefaultLanguage(formId: number): string {
    return this.languageInstances$.value.find(instance => instance.formId === formId)?.defaultLanguage;
  }

  getDefaultLanguage$(formId: number): Observable<string> {
    return this.languageInstances$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.defaultLanguage),
      distinctUntilChanged(),
    );
  }

  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeader$(formId: number): Observable<boolean> {
    return this.languageInstances$.pipe(
      map(languageInstances => languageInstances.find(langInstance => langInstance.formId === formId)?.hideHeader),
      distinctUntilChanged(),
    );
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    const languageInstance: Partial<LanguageInstance> = { formId, hideHeader };
    this.updateOneInCache(languageInstance);
  }
}
