import { computed, Injectable, signal, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable, shareReplay } from 'rxjs';
import { EntityReader } from '../../helpers';
import { BaseDataService } from './base-data.service';
import { mapUntilChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { FormLanguage, FormLanguageComplete } from '../../../state/form-languages.model';

@Injectable({ providedIn: 'root' })
export class LanguageInstanceService extends BaseDataService<FormLanguageInStore> {

  private formLanguageInStoreSig = signal<Record<number, FormLanguageInStore>>({});

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('FormLanguageInStore', serviceElementsFactory);
  }

  addToStore(formId: number, primary: string, current: string, hideHeader: boolean): void {
    // TODO:: Old Code, remove after testing ist done
    this.addOneToCache({
      formId,
      current,
      initial: current,
      primary,
      hideHeader,
    } satisfies FormLanguageInStore);


    const newFormLanguage: FormLanguageInStore = {
      formId,
      current,
      initial: current,
      primary,
      hideHeader,
    };

    this.formLanguageInStoreSig.set({
      ...this.formLanguageInStoreSig(),
      [formId]: newFormLanguage,
    });

  }

  removeFromStore(formId: number): void {
    // TODO:: Old Code, remove after testing ist done
    this.removeOneFromCache(formId);

    const updatedStore = { ...this.formLanguageInStoreSig() };
    delete updatedStore[formId];
    this.formLanguageInStoreSig.set(updatedStore);

  }

  setCurrent(formId: number, newLanguage: string): void {
    // TODO:: Old Code, remove after testing ist done
    this.updateOneInCache({
      formId,
      current: newLanguage,
    } satisfies Partial<FormLanguageInStore>);

    const currentFormLanguage = this.formLanguageInStoreSig()[formId];

    if (currentFormLanguage) {
      const updatedFormLanguage: FormLanguageInStore = {
        ...currentFormLanguage,
        current: newLanguage,
      };

      this.formLanguageInStoreSig.set({
        ...this.formLanguageInStoreSig(),
        [formId]: updatedFormLanguage,
      });
    } else {
      console.warn(`Form with id ${formId} not found.`);
    }
  }

  /**
   * Get an EntityReader for the current form
   * use in fields settings service
   */
  getEntityReader$(formId: number) {
    // return toObservable(this.getLanguageSignal(formId)).pipe(
    //   map((language) => new EntityReader(language.current, language.primary)),
    //   // Ensure the EntityReader is reused and not recreated every time
    //   shareReplay(1)
    // );

    // // TODO old code
    return this.getLanguage$(formId)  // This is already distinctUntilChanged
      .pipe(
        map((language) => new EntityReader(language.current, language.primary)),
        // Ensure the EntityReader is reused and not recreated every time
        shareReplay(1)
      );
  }

  getEntityReader(formId: number): Signal<EntityReader> {
    const entityReader = computed(() => {
      const language = this.getLanguageSignal(formId);
      return new EntityReader(language().current, language().primary);
    });
    return entityReader;

    // TODO:: Old Code, remove after testing ist done
    // return toSignal(this.getEntityReader$(formId), { injector: this.injector });
  }

  // use in form config service for language$()
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
    const formLanguageComplete = computed(() => {
      const languageInstances = this.formLanguageInStoreSig();
      const found = Object.values(languageInstances).find(l => l.formId === formId);
      return {
        ...FormLanguage.empty,
        ...found,
      } satisfies FormLanguageComplete;
    });
    return formLanguageComplete;
    // TODO:: Old Code remove after testing ist done
    // var obs = this.getLanguage$(formId);
    // return this.signalsLanguageCache[formId] = toSignal(obs); // note: no initial value, it should always be up-to-date
  }
  private signalsLanguageCache: Record<number, Signal<FormLanguageComplete>> = {};


  // TODO:: Old Code, remove after testing ist done
  /** Get hideHeader for the form. Fix for safari and mobile browsers */
  // getHideHeader$(formId: number): Observable<boolean> {
  //   return this.cache$.pipe(
  //     map(languageInstances => languageInstances.find(languageInstance => languageInstance.formId === formId)?.hideHeader),
  //     mapUntilChanged(m => m),
  //   );
  // }

  getHideHeaderSignal(formId: number): Signal<boolean> {
    const cached = this.signalsHideHeaderCache[formId];
    if (cached) return cached;

    const sig = computed(() => {
      const languageInstance = this.formLanguageInStoreSig()[formId];
      return languageInstance?.hideHeader ?? false
    });
    return sig;

    // TODO:: Old Code, remove after testing ist done
    // var obs = this.getHideHeader$(formId);
    // return this.signalsHideHeaderCache[formId] = toSignal(obs); // note: no initial value, it should always be up-to-date
  }
  private signalsHideHeaderCache: Record<number, Signal<boolean>> = {};


  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  updateHideHeader(formId: number, hideHeader: boolean): void {
    const languageInstance: Partial<FormLanguageInStore> = { formId, hideHeader };
    // TODO:: Old Code, remove after testing ist done
    this.updateOneInCache(languageInstance);

    this.formLanguageInStoreSig.set({
      ...this.formLanguageInStoreSig(),
      [formId]: {
        ...this.formLanguageInStoreSig()[formId],
        hideHeader,
      },
    });
  }
}

export interface FormLanguageInStore extends FormLanguageComplete {
  formId: number;
  hideHeader: boolean;
}
