import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EavService } from '.';
import { ObjectModel } from '../models';

@Injectable()
export class FormsStateService implements OnDestroy {
  formsValid$: BehaviorSubject<boolean>;
  formsDirty$: BehaviorSubject<boolean>;

  private formsValid: ObjectModel<boolean>;
  private formsDirty: ObjectModel<boolean>;

  constructor(private eavService: EavService) { }

  ngOnDestroy() {
    this.formsValid$?.complete();
    this.formsDirty$?.complete();
  }

  init() {
    this.formsValid$ = new BehaviorSubject(false);
    this.formsDirty$ = new BehaviorSubject(false);
    this.formsValid = {};
    this.formsDirty = {};
    for (const entityGuid of this.eavService.eavConfig.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }
  }

  getFormValid(entityGuid: string) {
    return this.formsValid[entityGuid];
  }

  setFormValid(entityGuid: string, isValid: boolean) {
    this.formsValid[entityGuid] = isValid;

    const allValid = !Object.values(this.formsValid).some(valid => valid === false);
    if (allValid !== this.formsValid$.value) {
      this.formsValid$.next(allValid);
    }
  }

  setFormDirty(entityGuid: string, isDirty: boolean) {
    this.formsDirty[entityGuid] = isDirty;

    const anyDirty = Object.values(this.formsDirty).some(dirty => dirty === true);
    if (anyDirty !== this.formsDirty$.value) {
      this.formsDirty$.next(anyDirty);
    }
  }
}
