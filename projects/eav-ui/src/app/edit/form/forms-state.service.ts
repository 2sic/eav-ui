import { Injectable, Signal, signal } from '@angular/core';
import { classLog } from '../../../../../shared/logging';
import { SignalEquals } from '../../shared/signals/signal-equals';
import { computedObj } from '../../shared/signals/signal.utilities';
import { LanguageService } from '../localization/language.service';
import { ItemService } from '../state/item.service';
import { FormConfigService } from './form-config.service';

/**
 * Service to manage the state of forms.
 * Mainly to determine if valid, read-only etc.
 */
@Injectable()
export class FormsStateService {

  log = classLog({FormsStateService});

  /** Signal which is filled by sub-dialogs to trigger save (other saves like ctrl+s don't go through this) */
  public triggerTrySaveAndMaybeClose = signal({ tryToSave: false, close: false }, SignalEquals.ref);
  public formsAreValid = signal(false);
  public formsAreDirty = signal(false);

  #formsValid: Record<string, boolean> = {};
  #formsDirty: Record<string, boolean> = {};

  readOnly: Signal<FormReadOnly> = (() => {
    const itemHeaders = signal(this.formConfig.config.itemGuids
      .map(guid => this.itemService.getItemHeaderSignal(guid))
    );
    const language = this.languageService.getAllSignal();

    const readOnly = computedObj('readOnly', () => {
      const itemsReadOnly = itemHeaders().some(itemHeader => itemHeader()?.EditInfo?.ReadOnly ?? false);
      const languageAllowed = language().find(l => l.NameId === this.formConfig.language().current)?.IsAllowed ?? true;
      const isReadOnly = itemsReadOnly || !languageAllowed;
      const reason = itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined;

      return {
        isReadOnly,
        reason,
      } satisfies FormReadOnly;
    });
    return readOnly;
  })();

  // readOnly: Signal<FormReadOnly>;
  formsValidTemp = signal<boolean>(false);
  saveButtonDisabled = computedObj('saveButtonDisabled', () => this.readOnly().isReadOnly || !this.formsValidTemp());

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
  ) {
    // Reset initial dirty/valid states
    for (const entityGuid of this.formConfig.config.itemGuids) {
      this.#formsValid[entityGuid] = false;
      this.#formsDirty[entityGuid] = false;
    }
  }

  getFormValid(entityGuid: string) {
    return this.#formsValid[entityGuid];
  }

  setFormValid(entityGuid: string, isValid: boolean) {
    this.#formsValid[entityGuid] = isValid;

    const allValid = !Object.values(this.#formsValid).some(valid => valid === false);
    if (allValid !== this.formsValidTemp()) {
      this.formsValidTemp.set(allValid);
      this.formsAreValid.set(allValid);
    }
  }

  setFormDirty(entityGuid: string, isDirty: boolean) {
    this.#formsDirty[entityGuid] = isDirty;

    const anyDirty = Object.values(this.#formsDirty).some(dirty => dirty === true);
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
