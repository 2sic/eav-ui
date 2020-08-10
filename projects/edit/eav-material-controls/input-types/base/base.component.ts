import { Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, filter, distinctUntilChanged } from 'rxjs/operators';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../eav-dynamic-form/model/field';
import { FieldSettings } from '../../../../edit-types';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationHelper } from '../../validators/validation-helper';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

export class BaseComponent<T> implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  settings$: Observable<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  value$: Observable<T>;
  disabled$: Observable<boolean>;
  required$: Observable<boolean>;
  invalid$: Observable<boolean>;
  showValidation$: Observable<AbstractControl>;
  subscription = new Subscription();

  constructor(public eavService: EavService, public validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.settings$ = this.config.field.settings$;
    this.label$ = this.settings$.pipe(map(settings => settings.Name));
    this.placeholder$ = this.settings$.pipe(map(settings => settings.Placeholder));
    this.required$ = this.settings$.pipe(map(settings => ValidationHelper.isRequired(settings)));
    this.invalid$ = this.control.statusChanges.pipe(map(status => status === 'INVALID'), startWith(this.control.invalid));
    this.showValidation$ = this.validationMessagesService.showValidation$.pipe(filter(control => control === this.control));
    // doesn't work because controls are sometimes updated without emitting change (e.g. on language change)
    // this.value$ = this.control.valueChanges.pipe(
    //   startWith(this.control.value)
    // );
    // this.status$ = this.control.statusChanges.pipe(
    //   startWith(this.control.status)
    // );
    this.value$ = this.eavService.formValueChange$.pipe(
      filter(formSet => (formSet.formId === this.config.form.formId) && (formSet.entityGuid === this.config.entity.entityGuid)),
      map(formSet => this.control.value),
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    this.disabled$ = this.eavService.formDisabledChange$.asObservable().pipe(
      filter(formDisabledSet => (formDisabledSet.formId === this.config.form.formId)
        && (formDisabledSet.entityGuid === this.config.entity.entityGuid)
      ),
      map(formSet => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
