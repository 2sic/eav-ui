import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { ControlStatus } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { FieldConfigSet, FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';
import { Field } from '../../builder/fields-builder/field.model';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseFieldComponent<T = FieldValue> extends BaseComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;

  controlConfig: FieldControlConfig = {};

  control: AbstractControl;
  controlStatus$: BehaviorSubject<ControlStatus<T>>;
  settings$: BehaviorSubject<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  required$: Observable<boolean>;

  // TODO: @2DM - GET RED OF THE FORMcONFIG HERE
  constructor(public fieldsSettingsService: FieldsSettingsService) { super(); }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];

    this.controlStatus$ = new BehaviorSubject({
      dirty: this.control.dirty,
      disabled: this.control.disabled,
      invalid: this.control.invalid,
      touched: this.control.touched,
      value: this.control.value,
    });
    this.control.valueChanges.subscribe(() => {
      this.controlStatus$.next({
        dirty: this.control.dirty,
        disabled: this.control.disabled,
        invalid: this.control.invalid,
        touched: this.control.touched,
        value: this.control.value,
      });
    });

    this.settings$ = new BehaviorSubject(this.fieldsSettingsService.getFieldSettings(this.config.fieldName));
    this.subscriptions.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.placeholder$ = this.settings$.pipe(map(settings => settings.Placeholder), distinctUntilChanged());
    this.required$ = this.settings$.pipe(map(settings => settings._currentRequired), distinctUntilChanged());
  }

  ngOnDestroy() {
    this.controlStatus$.complete();
    this.settings$.complete();
    super.ngOnDestroy();
  }
}
