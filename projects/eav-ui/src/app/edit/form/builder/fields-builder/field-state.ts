import { Observable } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { Signal } from '@angular/core';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';

/**
 * Experimental 2dm.
 *
 * This is provided / injected at the fields-builder for every single field.
 * 
 * So any control or service within that field, which requests this service, will get one containing exactly that fields.
 */
export class FieldState {
  constructor(
    public name: string,
    public config: FieldConfigSet,
    public controlConfig: FieldControlConfig,
    public group: UntypedFormGroup,
    public control: AbstractControl,
    public settings$: Observable<FieldSettings>,
    public settings: Signal<FieldSettings>,
    public basics: Signal<BasicControlSettings>
  ) { }
}
