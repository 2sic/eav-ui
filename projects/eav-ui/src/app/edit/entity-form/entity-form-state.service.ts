import { Injectable, signal } from '@angular/core';
import { EavLogger } from '../../shared/logging/eav-logger';
import { UntypedFormGroup } from '@angular/forms';

const logSpecs = {
  enabled: false,
  name: 'EntityFormStateService',
  specs: {
    all: false,
    setup: false,
  }
};

/**
 * Experimental: provide a service to hold the form group and anything specific to a form.
 * 
 * This is specific to a single entity.
 */
@Injectable()
export class EntityFormStateService {

  log = new EavLogger(logSpecs);

  constructor() { }

  controlsCreated = signal(false);

  setup(formGroup: UntypedFormGroup) {
    this.log.fnIf('setup', { formGroup });
    this.#formGroup = formGroup;
    return this;
  }

  public formGroup() {
    if (!this.#formGroup) throw new Error('Form Group not set');
    return this.#formGroup;
  }

  /** The Form Group, must be added by the FormBuilderComponent */
  #formGroup: UntypedFormGroup;
}