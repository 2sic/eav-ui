import { inject, Injectable, Injector, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable, shareReplay } from 'rxjs';
import { EntityReader } from '../../helpers';
import { BaseDataService } from './base-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapUntilChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { FormLanguage, FormLanguageComplete } from '../../../state/form-languages.model';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends BaseDataService<FormLanguageInStore> {
  private injector = inject(Injector);

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('FormLanguageInStore', serviceElementsFactory);
  }

  addToStore(formId: number, primary: string, current: string, hideHeader: boolean): void {
    this.addOneToCache({
      formId,
      current,
      initial: current,
      primary,
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

  /**
   * Get an EntityReader for the current form
   */
  getEntityReader$(formId: number) {
    return this.getLanguage$(formId)  // This is already distinctUntilChanged
      .pipe(
        map((language) => new EntityReader(language.current, language.primary)),
        // Ensure the EntityReader is reused and not recreated every time
        shareReplay(1)
      );
  }

  getEntityReader(formId: number): Signal<EntityReader> {
    return toSignal(this.getEntityReader$(formId), { injector: this.injector });
  }

  getLanguage$(formId: number): Observable<FormLanguageComplete> {
    // if (this.get$Cache[formId])
    //   return this.get$Cache[formId];

    return /* this.get$Cache[formId] = */ this.cache$.pipe(
      map(languageInstances => {
        const found = languageInstances.find(l => l.formId === formId);
        return {
          ...FormLanguage.empty,
          ...found,
        } satisfies FormLanguageComplete;
      }),
      mapUntilChanged(m => m),
      // distinctUntilChanged(),
      // Ensure the EntityReader is reused and not recreated every time
      // todo: this probably doesn't have a real effect...
      shareReplay(1)
    );
  }

  getLanguageSignal(formId: number): Signal<FormLanguageComplete> {
  const cached = this.signalsLanguageCache[formId];
  if (cached) return cached;
  var obs = this.getLanguage$(formId);
  return this.signalsLanguageCache[formId] = toSignal(obs); // note: no initial value, it should always be up-to-date
}
private signalsLanguageCache: Record<number, Signal<FormLanguageComplete>> = {};



  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeader$(formId: number): Observable<boolean> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.hideHeader),
      mapUntilChanged(m => m),
    );
  }

  getHideHeaderSignal(formId: number): Signal<boolean> {
    const cached = this.signalsHideHeaderCache[formId];
    if (cached) return cached;
    var obs = this.getHideHeader$(formId);
    return this.signalsHideHeaderCache[formId] = toSignal(obs); // note: no initial value, it should always be up-to-date
  }
  private signalsHideHeaderCache: Record<number, Signal<boolean>> = {};


  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    const languageInstance: Partial<FormLanguageInStore> = { formId, hideHeader };
    this.updateOneInCache(languageInstance);
  }
}

export interface FormLanguageInStore extends FormLanguageComplete {
  formId: number;
  hideHeader: boolean;
}
