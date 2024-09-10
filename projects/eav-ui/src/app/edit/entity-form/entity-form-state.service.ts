import { Injectable, OnDestroy, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { classLog } from '../../shared/logging';
import { ServiceBase } from '../../shared/services/service-base';

/**
 * A Service to hold the form group and anything specific to a form.
 * 
 * Important: This is specific to a single entity.
 */
@Injectable()
export class EntityFormStateService extends ServiceBase implements OnDestroy {

  log = classLog({EntityFormStateService});

  constructor() {
    super();
  }

  /** Signal to determine that the form group has been initialized */
  controlsCreated = signal(false);

  /** The Form Group */
  public readonly formGroup = new UntypedFormGroup({});

}