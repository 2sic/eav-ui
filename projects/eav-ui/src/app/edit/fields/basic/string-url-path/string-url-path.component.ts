import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { StringUrlPathLogic } from './string-url-path-logic';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMask, UrlHelpers } from '../../../shared/helpers';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { BaseComponent } from '../../../../shared/components/base.component';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { mapUntilChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

const logThis = false;
const nameOfThis = 'StringUrlPathComponent';

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
export class StringUrlPathComponent extends BaseComponent implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;
  public control = this.fieldState.control;

  /** The mask to use comes from the field settings */
  #maskFromSettings = computed(() => this.fieldState.settings().AutoGenerateMask, SignalHelpers.stringEquals);

  /**
   * Blocks external update if field was changed manually and doesn't match external updates.
   * WARNING: Doesn't work on language change
   * TODO: MAKE work on language change
   */
  #lastAutoCopy = signal('');

  /** The Field-Mask Helper which will continuously parse the result */
  #fieldMask = transient(FieldMask)
    .initPreClean((_, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value)
    .initCallback((newValue) => this.#onSourcesChanged(newValue))
    .initSignal('UrlPath', this.#maskFromSettings)
    .logChanges();

  /** The cleaned value, ready for broadcasting back to the field */
  #maskedValueCleaned = computed(() => {
    const newValue = this.#fieldMask.resolve();
    return UrlHelpers.stripNonUrlCharacters(newValue, this.settings().AllowSlashes, true);
  });

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    StringUrlPathLogic.importMe();

    // Listen to value changes to correct spaces and other non-allowed characters
    effect(() => {
      const _ = this.fieldState.uiValue();
      this.clean(false);
    });
  }

  ngOnInit() {
    this.log.a('ngOnInit');
  }

  #onSourcesChanged(newValue: string) {
    const l = this.log.fn('#onSourcesChanged', { newValue });

    const cleaned = UrlHelpers.stripNonUrlCharacters(newValue, this.settings().AllowSlashes, true);

    const v = {
      newValue,
      uiValue: this.control.value,
      lastAutoCopy: this.#lastAutoCopy(),
      allowSlashes: this.settings().AllowSlashes,
      cleaned, //: this.#maskedValueCleaned() as string,
    };

    // Exit early if the UI is a) not empty and b) doesn't have the last copy of the stripped value
    if (v.uiValue && (v.uiValue !== v.lastAutoCopy))
      return l.end(v, `UI not empty but manually modified, so no auto-update`);

    if (!v.cleaned)
      return l.end(v, 'cleaned is empty');

    if (v.uiValue === v.cleaned)
      return l.end(v, 'no changes');

    this.#lastAutoCopy.set(v.cleaned);
    ControlHelpers.patchControlValue(this.control, v.cleaned);
    l.end(v, `updated to "${v.cleaned}"`);
  }

  clean(trimEnd: boolean) {
    const l = this.log.fn('clean', { trimEnd });
    const value = this.control.value;
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings().AllowSlashes, trimEnd);
    if (value === cleaned) return;
    ControlHelpers.patchControlValue(this.control, cleaned);
  }
}
