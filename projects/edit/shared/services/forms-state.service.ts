import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { EavService } from '.';
import { ItemService } from '../store/ngrx-data';

@Injectable()
export class FormsStateService implements OnDestroy {
  readOnly$: BehaviorSubject<boolean>;
  formsValid$: BehaviorSubject<boolean>;
  formsDirty$: BehaviorSubject<boolean>;

  private formsValid: Record<string, boolean>;
  private formsDirty: Record<string, boolean>;
  private subscription: Subscription;

  constructor(private eavService: EavService, private itemService: ItemService) { }

  ngOnDestroy() {
    this.readOnly$?.complete();
    this.formsValid$?.complete();
    this.formsDirty$?.complete();
    this.subscription?.unsubscribe();
  }

  init() {
    this.subscription = new Subscription();
    this.readOnly$ = new BehaviorSubject(true);
    this.formsValid$ = new BehaviorSubject(false);
    this.formsDirty$ = new BehaviorSubject(false);
    this.formsValid = {};
    this.formsDirty = {};
    for (const entityGuid of this.eavService.eavConfig.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    this.subscription.add(
      combineLatest(
        this.eavService.eavConfig.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid)),
      ).subscribe(itemHeaders => {
        const readOnly = itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false);
        if (readOnly !== this.readOnly$.value) {
          this.readOnly$.next(readOnly);
        }
      })
    );
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
