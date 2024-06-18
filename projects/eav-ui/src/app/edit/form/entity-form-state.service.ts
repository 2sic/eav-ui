import { Injectable } from '@angular/core';
import { ServiceBase } from '../../shared/services/service-base'
import { EavLogger } from '../../shared/logging/eav-logger';
import { UntypedFormGroup } from '@angular/forms';

const logThis = true;
const nameOfThis = 'EntityFormStateService';

/**
 * Experimental: provide a service to hold the form group and anything specific to the form.
 */
@Injectable()
export class EntityFormStateService extends ServiceBase {
  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  setup(formGroup: UntypedFormGroup) {
    this.log.a('Setting up form group');
    this._formGroup = formGroup;
  }

  public formGroup() {
    if (!this._formGroup) throw new Error('Form Group not set');
    return this._formGroup;
  }

  /** The Form Group, must be added by the FormBuilderComponent */
  private _formGroup: UntypedFormGroup;
}