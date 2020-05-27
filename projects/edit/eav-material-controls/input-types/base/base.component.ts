import { Input, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, filter, distinctUntilChanged } from 'rxjs/operators';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../eav-dynamic-form/model/field';
import { FieldSettings } from '../../../../edit-types';
import { EavService } from '../../../shared/services/eav.service';

export class BaseComponent<T> implements Field, OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  settings$: Observable<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  value$: Observable<T>;
  // disabled$: Observable<boolean>;

  constructor(private eavService: EavService) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.settings$ = this.config.field.settings$;
    this.label$ = this.config.field.settings$.pipe(map(settings => settings.Name));
    this.placeholder$ = this.config.field.settings$.pipe(map(settings => settings.Placeholder));
    // doesn't work because controls are sometimes updated without emitting change (e.g. on language change)
    // this.value$ = this.group.controls[this.config.field.name].valueChanges.pipe(
    //   startWith(this.group.controls[this.config.field.name].value)
    // );
    // this.status$ = this.group.controls[this.config.field.name].statusChanges.pipe(
    //   startWith(this.group.controls[this.config.field.name].status)
    // );
    this.value$ = this.eavService.formSetValueChange$.pipe(
      filter(formSet => (formSet.formId === this.config.form.formId) && (formSet.entityGuid === this.config.entity.entityGuid)),
      map(formSet => this.control.value),
      distinctUntilChanged(),
      startWith(this.control.value),
    );
    // doesn't work because control status is updated after value change
    // this.disabled$ = this.eavService.formSetValueChange$.pipe(
    //   filter(formSet => (formSet.formId === this.config.form.formId) && (formSet.entityGuid === this.config.entity.entityGuid)),
    //   map(formSet => this.control.status === 'DISABLED'),
    //   distinctUntilChanged(),
    //   startWith(this.control.status === 'DISABLED'),
    // );
  }
}
