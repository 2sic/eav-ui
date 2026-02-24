import { Injectable, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { classLog } from '../../../../../shared/logging';

/**
 * A Service to hold the form group and anything specific to a form.
 *
 * Important: This is specific to a single entity.
 */
@Injectable()
export class EntityFormStateService {

  log = classLog({EntityFormStateService});

  constructor() {
    // console.log('2dm - EntityFormStateService - constructor');
  }

  /** Signal to determine that the form group has been initialized */
  controlsCreated = signal(false);

  isSaving = signal(false);

  /** The Form Group */
  public readonly formGroup = new UntypedFormGroup({});

}
