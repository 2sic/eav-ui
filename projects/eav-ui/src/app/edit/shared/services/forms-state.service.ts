import { computed, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, sample, Subject, Subscription } from 'rxjs';
import { FormConfigService } from '.';
import { FormReadOnly } from '../models';
import { ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';
import { RxHelpers } from '../../../shared/rxJs/rx.helpers';

@Injectable()
export class FormsStateService implements OnDestroy {
  saveForm$: Subject<boolean>;
  readOnly$: BehaviorSubject<FormReadOnly>;
  formsValid$: BehaviorSubject<boolean>;
  formsDirty$: BehaviorSubject<boolean>;
  saveButtonDisabled$: Observable<boolean>;

  private formsValid: Record<string, boolean>;
  private formsDirty: Record<string, boolean>;
  private subscription: Subscription;

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
  ) { }

  ngOnDestroy() {
    this.saveForm$.complete();
    this.readOnly$?.complete();
    this.formsValid$?.complete();
    this.formsDirty$?.complete();
    this.subscription?.unsubscribe();
  }

  init() {
    this.subscription = new Subscription();
    this.saveForm$ = new Subject();
    const initialReadOnly: FormReadOnly = { isReadOnly: true, reason: undefined };
    this.readOnly$ = new BehaviorSubject(initialReadOnly);
    this.formsValid$ = new BehaviorSubject(false);
    this.formsDirty$ = new BehaviorSubject(false);
    this.saveButtonDisabled$ = combineLatest([this.readOnly$, this.formsValid$]).pipe(
      map(([readOnly, formsValid]) => readOnly.isReadOnly || !formsValid),
      distinctUntilChanged(),
    );

    // TODO:: Signals combineLatest, gibt direkt einen Wert zurück und nicht erst dann, wenn alle Werte vorhanden sind
  //   const $v = computed(() => $foo() * $bar());
  //   // same as
  //   const v$ = combineLatest([foo$, bar$]).pipe(
  //     map(([foo, bar]) => foo * bar)
  // );

    this.formsValid = {};
    this.formsDirty = {};
    for (const entityGuid of this.formConfig.config.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    this.subscription.add(
      combineLatest([
        combineLatest(this.formConfig.config.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid))).pipe(
          map(itemHeaders => itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false)),
        ),
        combineLatest([
          this.languageStore.getLanguage$(this.formConfig.config.formId),
          this.languageService.getLanguages$(),
        ]).pipe(
          map(([language, languages]) => languages.find(l => l.NameId === language.current)?.IsAllowed ?? true),
        ),
      ]).subscribe(([itemsReadOnly, languageAllowed]) => {
        const readOnly: FormReadOnly = {
          isReadOnly: itemsReadOnly || !languageAllowed,
          reason: itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined,
        };
        if (!RxHelpers.objectsEqual(readOnly, this.readOnly$.value)) {
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
