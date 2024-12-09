import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { transient } from '../../../../../../../core/transient';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldMask, UrlHelpers } from '../../../shared/helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringUrlPathLogic } from './string-url-path-logic';

@Component({
    selector: InputTypeCatalog.StringUrlPath,
    templateUrl: './string-url-path.component.html',
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FieldHelperTextComponent,
    ]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringUrlPathComponent {

  log = classLog({StringUrlPathComponent});

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  /** The mask to use comes from the field settings */
  #maskFromSettings = this.fieldState.settingExt('AutoGenerateMask');

  /**
   * Blocks external update if field was changed manually and doesn't match external updates.
   * WARNING: Doesn't work on language change
   * TODO: MAKE work on language change
   */
  #lastAutoCopy = signal('');

  /** The Field-Mask Helper which will continuously parse the result */
  #fieldMask = transient(FieldMask)
    // .logChanges()
    .initPreClean((_, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value)
    .initSignal('UrlPath', this.#maskFromSettings);

  /** The cleaned value, ready for broadcasting back to the field */
  #maskedValueCleaned = computed(() => {
    const newValue = this.#fieldMask.result();
    return UrlHelpers.stripNonUrlCharacters(newValue, this.settings().AllowSlashes, true);
  });

  constructor() {
    StringUrlPathLogic.importMe();

    // Listen to value changes to correct spaces and other non-allowed characters
    effect(() => {
      const _ = this.fieldState.uiValue();
      this.clean(false);
    });

    // Listen to the mask changes to update the field
    effect(() => this.#publishFieldMaskResult(this.#maskedValueCleaned()));
  }


  #publishFieldMaskResult(cleanedNewValue: string) {
    const l = this.log.fn('#onSourcesChanged', { newValue: cleanedNewValue });

    const v = {
      uiValue: this.fieldState.uiValue(),
      lastAutoCopy: this.#lastAutoCopy(),
      allowSlashes: this.settings().AllowSlashes,
      cleaned: cleanedNewValue,
    };

    // Exit early if the UI is a) not empty and b) doesn't have the last copy of the stripped value
    if (v.uiValue && (v.uiValue !== v.lastAutoCopy))
      return l.end(`UI not empty but manually modified, so no auto-update`, v);

    if (!v.cleaned)
      return l.end('cleaned is empty', v);

    if (v.uiValue === v.cleaned)
      return l.end('no changes', v);

    this.#lastAutoCopy.set(v.cleaned);
    this.fieldState.ui().setIfChanged(v.cleaned);
    l.end(`updated to "${v.cleaned}"`, v);
  }

  clean(trimEnd: boolean) {
    const l = this.log.fn('clean', { trimEnd });
    const value = this.fieldState.uiValue();
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings().AllowSlashes, trimEnd);
    this.fieldState.ui().setIfChanged(cleaned);
  }
}
