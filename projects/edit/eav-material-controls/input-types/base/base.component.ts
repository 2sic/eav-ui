import { Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { Field } from '../../../eav-dynamic-form/model/field';
import { FieldSettings } from '../../../../edit-types';

export class BaseComponent implements Field, OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  settings$: Observable<FieldSettings>;
  label$: Observable<string>;
  placeholder$: Observable<string>;

  constructor() { }

  ngOnInit() {
    this.settings$ = this.config.field.settings$;
    this.label$ = this.config.field.settings$.pipe(map(settings => settings.Name));
    this.placeholder$ = this.config.field.settings$.pipe(map(settings => settings.Placeholder));
  }
}
