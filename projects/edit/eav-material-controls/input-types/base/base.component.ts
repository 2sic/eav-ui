import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { Field } from '../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { EavService, FieldsSettingsService } from '../../../shared/services';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseComponent<T = any> implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  settings$: BehaviorSubject<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  value$: Observable<T>;
  disabled$: BehaviorSubject<boolean>;
  required$: Observable<boolean>;
  invalid$: Observable<boolean>;
  /** Required for validation messages */
  touched$: Observable<boolean>;
  dirty$: Observable<boolean>;
  subscription: Subscription;

  constructor(public eavService: EavService, public fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.fieldName];
    this.subscription = new Subscription();

    this.settings$ = new BehaviorSubject<FieldSettings>(this.fieldsSettingsService.getFieldSettings(this.config.fieldName));
    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.placeholder$ = this.settings$.pipe(map(settings => settings.Placeholder), distinctUntilChanged());
    this.required$ = this.settings$.pipe(map(settings => settings.Required), distinctUntilChanged());

    this.invalid$ = this.control.valueChanges.pipe(
      map(() => this.control.invalid),
      startWith(this.control.invalid),
      distinctUntilChanged(),
    );
    this.touched$ = this.control.valueChanges.pipe(
      map(() => this.control.touched),
      startWith(this.control.touched),
      distinctUntilChanged(),
    );
    this.dirty$ = this.control.valueChanges.pipe(
      map(() => this.control.dirty),
      startWith(this.control.dirty),
      distinctUntilChanged(),
    );
    this.value$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    this.disabled$ = new BehaviorSubject(this.control.disabled);
    this.subscription.add(
      this.control.valueChanges.pipe(
        map(() => this.control.disabled),
        startWith(this.control.disabled),
        distinctUntilChanged(),
      ).subscribe(disabled => {
        this.disabled$.next(disabled);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
