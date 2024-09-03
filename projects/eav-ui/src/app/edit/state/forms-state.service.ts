import { computed, Injectable, signal } from '@angular/core';
import { FormConfigService } from './form-config.service';
import { EavLogger } from '../../shared/logging/eav-logger';
import { SignalEquals } from '../../shared/signals/signal-equals';
import { ItemService } from '../shared/store/item.service';
import { LanguageService } from '../shared/store/language.service';
import isEqual from 'lodash-es/isEqual';

const logThis = false;
const nameOfThis = 'FormsStateService';

/**
 * Service to manage the state of forms.
 * Mainly to determine if valid, read-only etc.
 */
@Injectable()
export class FormsStateService {

  /** Signal which is filled by sub-dialogs to trigger save (other saves like ctrl+s don't go through this) */
  triggerTrySaveAndMaybeClose = signal({ tryToSave: false, close: false }, SignalEquals.ref);
  formsAreValid = signal(false);
  formsAreDirty = signal(false);
  readOnly = signal<FormReadOnly>({ isReadOnly: true, reason: undefined }, { equal: isEqual });
  formsValidTemp = signal<boolean>(false);
  saveButtonDisabled = computed(() => this.readOnly().isReadOnly || !this.formsValidTemp());

  private formsValid: Record<string, boolean> = {};
  private formsDirty: Record<string, boolean> = {};

  log = new EavLogger(nameOfThis, logThis);
  
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
  ) { }

  init() {
    // Reset initial dirty/valid states
    for (const entityGuid of this.formConfig.config.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    const itemHeaders = signal(this.formConfig.config.itemGuids
      .map(guid => this.itemService.getItemHeaderSignal(guid))
    );
    const language = this.languageService.getAllSignal();

    const sig = computed<FormReadOnly>(() => {
      const itemsReadOnly = itemHeaders().some(itemHeader => itemHeader().EditInfo?.ReadOnly ?? false);
      const languageAllowed = language().find(l => l.NameId === this.formConfig.language().current)?.IsAllowed ?? true;
      const isReadOnly = itemsReadOnly || !languageAllowed;
      const reason = itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined;

      return {
        isReadOnly,
        reason,
      };
    });

    // TODO: @2DM - this won't work, as it won't update the readOnly signal
    this.readOnly.set(sig());

    // TODO:: @2dg Old code to be removed after testing is done
    //   this.subscriptions.add(
    //     combineLatest([
    //       combineLatest(this.formConfig.config.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid))).pipe(
    //         map(itemHeaders => itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false)),
    //       ),
    //       combineLatest([
    //         this.formConfig.language$,
    //         this.languageService.getLanguages$(), // TODO:: Remove later
    //       ]).pipe(
    //         map(([language, languages]) => languages.find(l => l.NameId === language.current)?.IsAllowed ?? true),
    //       ),
    //     ]).subscribe(([itemsReadOnly, languageAllowed]) => {
    //       const readOnly: FormReadOnly = {
    //         isReadOnly: itemsReadOnly || !languageAllowed,
    //         reason: itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined,
    //       };
    //       this.readOnly.set(readOnly);
    //     })
    //   );
  }

  getFormValid(entityGuid: string) {
    return this.formsValid[entityGuid];
  }

  setFormValid(entityGuid: string, isValid: boolean) {
    this.formsValid[entityGuid] = isValid;

    const allValid = !Object.values(this.formsValid).some(valid => valid === false);
    if (allValid !== this.formsValidTemp()) {
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
  }
}


interface FormReadOnly {
  isReadOnly: boolean;
  reason: undefined | 'Form' | 'Language';
}
