import { Component, inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, UrlHelpers } from '../../../../shared/helpers';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { StringUrlPathLogic } from './string-url-path-logic';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';

const logThis = false;
const nameOfThis = 'StringUrlPathComponent';
@Component({
  selector: InputTypeConstants.StringUrlPath,
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

  private fieldMask = FieldMask.createTransient(inject(Injector));

  /** Blocks external update if field was changed manually and doesn't match external updates. WARNING: Doesn't work on language change */
  private lastAutoCopy = '';

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    StringUrlPathLogic.importMe();
  }

  ngOnInit() {
    this.log.a('ngOnInit');

    this.subscriptions.add(
      this.fieldState.settings$.pipe(
        map(settings => settings.AutoGenerateMask),
        distinctUntilChanged(),
      ).subscribe(autoGenerateMask => {

        this.fieldMask
          .initPreClean((key, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value)
          .initCallback((newValue) => { this.onSourcesChanged(newValue); })
          .init('UrlPath', autoGenerateMask);
          // .logChanges();

        this.onSourcesChanged(this.fieldMask.resolve());
      })
    );

    // clean on value change
    this.subscriptions.add(
      this.control.valueChanges.subscribe(() => {
        this.clean(false);
      })
    );
  }

  private onSourcesChanged(newValue: string) {
    const value = this.control.value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (value && value !== this.lastAutoCopy) return;

    // TODO::  this.settings$.value.AllowSlashes to signal, settings has no value or AllowSlashes
    const cleaned = UrlHelpers.stripNonUrlCharacters(newValue, this.settings().AllowSlashes, true);
    if (!cleaned) return;
    this.lastAutoCopy = cleaned;
    if (value === cleaned) return;
    ControlHelpers.patchControlValue(this.control, cleaned);
  }

  clean(trimEnd: boolean) {
    const value = this.control.value;
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings().AllowSlashes, trimEnd);
    if (value === cleaned) return;
    ControlHelpers.patchControlValue(this.control, cleaned);
  }
}
