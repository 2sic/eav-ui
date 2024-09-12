import { SignalEquals } from '../../../../../app/shared/signals/signal-equals';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { StringUrlPathLogic } from './string-url-path-logic';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMask, UrlHelpers } from '../../../shared/helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { transient } from '../../../../core/transient';
import { classLog } from '../../../../shared/logging';

@Component({
  selector: InputTypeCatalog.StringUrlPath,
  templateUrl: './string-url-path.component.html',
  styleUrls: ['./string-url-path.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    FieldHelperTextComponent,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringUrlPathComponent {

  log = classLog({StringUrlPathComponent});

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  /** The mask to use comes from the field settings */
  #maskFromSettings = computed(() => this.fieldState.settings().AutoGenerateMask, SignalEquals.string);

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
    effect(() => this.#publishFieldMaskResult(this.#maskedValueCleaned()), { allowSignalWrites: true });
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
