import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldSettings, FieldValue } from '../../../../edit-types';
import { ControlStatus } from '../../../shared/models';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { Field } from '../../builder/fields-builder/field.model';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseComponent<T = FieldValue> implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  controlStatus$: BehaviorSubject<ControlStatus<T>>;
  settings$: BehaviorSubject<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  required$: Observable<boolean>;
  subscription: Subscription;

  constructor(public eavService: EavService, public fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    this.subscription = new Subscription();
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
    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.placeholder$ = this.settings$.pipe(map(settings => settings.Placeholder), distinctUntilChanged());
    this.required$ = this.settings$.pipe(map(settings => settings.Required), distinctUntilChanged());
  }

  ngOnDestroy() {
    this.controlStatus$.complete();
    this.settings$.complete();
    this.subscription.unsubscribe();
  }
}
