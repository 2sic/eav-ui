import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { toObservable } from '@angular/core/rxjs-interop';
import { ItemService, LanguageService } from '../shared/store/ngrx-data';
import { FormConfigService } from './form-config.service';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { SignalHelpers } from '../../shared/helpers/signal.helpers';

const logThis = false;
const nameOfThis = 'FormsStateService';

/**
 * Service to manage the state of forms.
 * Mainly to determine if valid, read-only etc.
 */
@Injectable()
export class FormsStateService extends ServiceBase implements OnDestroy {
  
  // new with Signal

  /** Signal which is filled by sub-dialogs to trigger save (other saves like ctrl+s don't go through this) */
  triggerTrySaveAndMaybeClose = signal({ tryToSave: false, close: false }, SignalHelpers.refEquals);
  formsAreValid = signal(false);
  formsAreDirty = signal(false);
  readOnly = signal<FormReadOnly>({ isReadOnly: true, reason: undefined }, { equal: RxHelpers.objectsEqual });
  formsValidTemp = signal<boolean>(false);
  saveButtonDisabled = computed(() => this.readOnly().isReadOnly || !this.formsValidTemp());

  // Old observables being changed to signals
  readOnly$ = toObservable(this.readOnly); // is used in fields-settings service

  private formsValid: Record<string, boolean> = {};
  private formsDirty: Record<string, boolean> = {};

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnDestroy() {
    // this.saveForm$.complete();
    super.destroy();
  }

  init() {

    for (const entityGuid of this.formConfig.config.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    // TODO:: @2dg getHeader Signal and Language Signal use computed

    this.subscriptions.add(
      combineLatest([
        combineLatest(this.formConfig.config.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid))).pipe(
          map(itemHeaders => itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false)),
        ),
        combineLatest([
          this.formConfig.language$,
          this.languageService.getLanguages$(), // TODO:: Remove later
        ]).pipe(
          map(([language, languages]) => languages.find(l => l.NameId === language.current)?.IsAllowed ?? true),
        ),
      ]).subscribe(([itemsReadOnly, languageAllowed]) => {
        const readOnly: FormReadOnly = {
          isReadOnly: itemsReadOnly || !languageAllowed,
          reason: itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined,
        };
        this.readOnly.set(readOnly);
      })
    );
  }

  getFormValid(entityGuid: string) {
    return this.formsValid[entityGuid];
  }

  setFormValid(entityGuid: string, isValid: boolean) {
    this.formsValid[entityGuid] = isValid;

    const allValid = !Object.values(this.formsValid).some(valid => valid === false);
    if (allValid !== this.formsValidTemp()) {
      // if (allValid !== this.formsValid$.value) {
      this.formsValidTemp.set(allValid);
      this.formsAreValid.set(allValid);
    }
  }

  setFormDirty(entityGuid: string, isDirty: boolean) {
    this.formsDirty[entityGuid] = isDirty;

    const anyDirty = Object.values(this.formsDirty).some(dirty => dirty === true);
    if (anyDirty !== this.formsAreDirty())
      this.formsAreDirty.set(anyDirty);
  }

  triggerSave(close: boolean) {
    this.triggerTrySaveAndMaybeClose.set({ tryToSave: true, close });
    // this.saveForm$.next(close);
  }
}


interface FormReadOnly {
  isReadOnly: boolean;
  reason: undefined | 'Form' | 'Language';
}