import { Injectable, Signal } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { EntityReader } from '../shared/helpers';
import { mapUntilChanged } from '../../shared/rxJs/mapUntilChanged';
import { FormLanguage, FormLanguageComplete } from './form-languages.model';
import { SignalStoreObservableBase } from '../shared/store/signal-store-observable-base';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { EavLogger } from '../../shared/logging/eav-logger';

const logSpecs = {
  enabled: true,
  name: 'FormLanguageService',
  specs: {
    getReader: false,
    getReaderSignal: false,
  }
};

@Injectable({ providedIn: 'root' })
export class FormLanguageService extends SignalStoreObservableBase<number, FormLanguageInStore> {

  log: EavLogger<typeof logSpecs.specs>;
  constructor() {
    super(logSpecs);
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
    const l = this.log.fnIf('getReader', { formId });
    // Place creation of the language signal here to avoid creating it multiple times
    const sig = this.#entityReaderCache.getOrCreateWithInfo(formId, () => {
      const language = this.getSignal(formId)() ?? FormLanguage.empty();
      const l2 = this.log.fnIf('getReaderSignal', { language });
      return new EntityReader(language.current, language.primary);
    });
    return l.rSilent(sig.signal, `isNew: ${sig.isNew}`);
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
