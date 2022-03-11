import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Subscription } from 'rxjs';
import { EavService } from '.';
import { GeneralHelpers } from '../helpers';
import { FormReadOnly } from '../models';
import { ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';

@Injectable()
export class FormsStateService implements OnDestroy {
  readOnly$: BehaviorSubject<FormReadOnly>;
  formsValid$: BehaviorSubject<boolean>;
  formsDirty$: BehaviorSubject<boolean>;

  private formsValid: Record<string, boolean>;
  private formsDirty: Record<string, boolean>;
  private subscription: Subscription;

  constructor(
    private eavService: EavService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
  ) { }

  ngOnDestroy() {
    this.readOnly$?.complete();
    this.formsValid$?.complete();
    this.formsDirty$?.complete();
    this.subscription?.unsubscribe();
  }

  init() {
    this.subscription = new Subscription();
    const initialReadOnly: FormReadOnly = { isReadOnly: true, reason: undefined };
    this.readOnly$ = new BehaviorSubject(initialReadOnly);
    this.formsValid$ = new BehaviorSubject(false);
    this.formsDirty$ = new BehaviorSubject(false);
    this.formsValid = {};
    this.formsDirty = {};
    for (const entityGuid of this.eavService.eavConfig.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    this.subscription.add(
      combineLatest([
        combineLatest(this.eavService.eavConfig.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid))).pipe(
          map(itemHeaders => itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false)),
        ),
        combineLatest([
          this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId),
          this.languageService.getLanguages$(),
        ]).pipe(
          map(([currentLanguage, languages]) => languages.find(l => l.NameId === currentLanguage)?.IsAllowed ?? true),
        ),
      ]).subscribe(([itemsReadOnly, languageAllowed]) => {
        const readOnly: FormReadOnly = {
          isReadOnly: itemsReadOnly || !languageAllowed,
          reason: itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined,
        };
        if (!GeneralHelpers.objectsEqual(readOnly, this.readOnly$.value)) {
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
