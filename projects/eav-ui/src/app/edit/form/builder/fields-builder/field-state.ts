import { Observable } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { Signal } from '@angular/core';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';
import { ControlStatus } from '../../../shared/models';

/**
 * This is provided / injected at the fields-builder for every single field.
 * So any control or service within that field, which requests this service, will get one containing exactly that fields.
 */
export class FieldState {
  constructor(
    /** The fields technical name to access settings etc. */
    public name: string,

    /** Field configuration, incl. a lot of unchanging values and access to adam, dropzone etc. */
    public config: FieldConfigSet,

    /** Configuration for the control. ATM only if it's a preview */
    public controlConfig: FieldControlConfig,

    /** The form group containing the field - rarely relevant, as you should use the control in most cases */
    public group: UntypedFormGroup,

    /** The control of the field in the form group */
    public control: AbstractControl,

    /** The settings as an observable - where possible, try to use the signal instead */
    public settings$: Observable<FieldSettings>,

    /** The settings as a signal - use this for most cases */
    public settings: Signal<FieldSettings>,

    /** The basic settings - use this for most cases as it will change less than the settings signal */
    public basics: Signal<BasicControlSettings>,

    public controlStatus: Signal<ControlStatus<unknown>>,
  ) { }
}
