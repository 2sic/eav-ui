import { Injectable, Signal } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { EntityReader } from '../helpers';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FormLanguage, FormLanguageComplete } from '../../state/form-languages.model';
import { SignalStoreObservableBase } from './signal-store-observable-base';
import { ComputedCacheHelper } from '../../../shared/signals/computed-cache';

const logThis = false;
const nameOfThis = 'LanguageInstanceService';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends SignalStoreObservableBase<number, FormLanguageInStore> {

  constructor() {
    super({ nameOfThis, logThis});
  }

  protected override getId = (item: FormLanguageInStore) => item.formId;

  protected override sanitizeAdd = (item: FormLanguageInStore) => ({
    ...FormLanguage.empty,
    initial: item.current,
    ...item
  });

  addForm(formId: number, primary: string, current: string, hideHeader: boolean): void {
    this.add({
      formId,
      current,
      initial: current,
      primary,
      hideHeader,
    } satisfies FormLanguageInStore);
  }

  setCurrent(formId: number, newLanguage: string): void {
    this.update(formId, { current: newLanguage } satisfies Partial<FormLanguageInStore>);
  }

  /**
   * Get an EntityReader for the current form.
   * ATM used in fields settings service.
   * 
   * If the form doesn't exist, the reader returned will not have the correct languages specified.
   * This is to avoid errors when the form is not yet loaded or is being unloaded.
   */
  getEntityReader(formId: number): Signal<EntityReader> {
    // Place creation of the language signal here to avoid creating it multiple times
    return this.#entityReaderCache.getOrCreate(formId, () => {
      const language = this.getSignal(formId)() ?? FormLanguage.empty();
      return new EntityReader(language.current, language.primary);
    });
  }
  #entityReaderCache = new ComputedCacheHelper<number, EntityReader>('entityReader');

  // use in form config service for language$()
  getLanguage$(formId: number): Observable<FormLanguageComplete> {
    return this.cache$.pipe(
      map(languageInstances => languageInstances[formId]),
      mapUntilChanged(m => m),
      shareReplay(1)
    );
  }

  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  getHideHeaderSignal(formId: number): Signal<boolean> {
    return this.#signalsHideHeaderCache.getOrCreate(formId, () => this.cache()[formId]?.hideHeader ?? false);
  }
  #signalsHideHeaderCache = new ComputedCacheHelper<number, boolean>('hideHeader');


  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    this.update(formId, { hideHeader } satisfies Partial<FormLanguageInStore>);
  }
}

export interface FormLanguageInStore extends FormLanguageComplete {
  formId: number;
  hideHeader: boolean;
}
