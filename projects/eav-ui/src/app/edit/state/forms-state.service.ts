import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, Subject, Subscription } from 'rxjs';
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { mapUntilChanged } from '../../shared/rxJs/mapUntilChanged';
import { toObservable } from '@angular/core/rxjs-interop';
import { ItemService, LanguageService } from '../shared/store/ngrx-data';
import { FormConfigService } from './form-config.service';

/**
 * Service to manage the state of forms.
 * Mainly to determine if valid, read-only etc.
 */
@Injectable()
export class FormsStateService implements OnDestroy {
  saveForm$: Subject<boolean>;
  formsValid$: BehaviorSubject<boolean>;
  formsDirty$: BehaviorSubject<boolean>;
  saveButtonDisabled$: Observable<boolean>;

  // new with Signal
  readOnly = signal<FormReadOnly>({ isReadOnly: true, reason: undefined }, { equal: RxHelpers.objectsEqual });
  formsValidTemp = signal<boolean>(false);
  saveButtonDisabled = computed(() => this.readOnly().isReadOnly || !this.formsValidTemp());

  // Old observables being changed to signals
  // TODO:: @2dm
  readOnly$ = toObservable(this.readOnly); // is used in fields-settings service

  private formsValid: Record<string, boolean>;
  private formsDirty: Record<string, boolean>;
  private subscription: Subscription;

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
  ) { }

  ngOnDestroy() {
    this.saveForm$.complete();
    this.formsValid$?.complete();
    this.formsDirty$?.complete();
    this.subscription?.unsubscribe();
  }

  init() {
    this.subscription = new Subscription();
    this.saveForm$ = new Subject();

    this.formsValid$ = new BehaviorSubject(false);
    this.formsDirty$ = new BehaviorSubject(false);
    this.saveButtonDisabled$ = combineLatest([this.readOnly$, this.formsValid$]).pipe(
      map(([readOnly, formsValid]) => readOnly.isReadOnly || !formsValid),
      mapUntilChanged(m => m),
    );

    this.formsValid = {};
    this.formsDirty = {};
    for (const entityGuid of this.formConfig.config.itemGuids) {
      this.formsValid[entityGuid] = false;
      this.formsDirty[entityGuid] = false;
    }

    // TODO:: @2dg getHeader Signal and Language Signal use computed

    this.subscription.add(
      combineLatest([
        combineLatest(this.formConfig.config.itemGuids.map(entityGuid => this.itemService.getItemHeader$(entityGuid))).pipe(
          map(itemHeaders => itemHeaders.some(itemHeader => itemHeader?.EditInfo?.ReadOnly ?? false)),
        ),
        combineLatest([
          this.formConfig.language$,
          this.languageService.getLanguages$(), // TODO:: Remove later
        ]).pipe(
          map(([language, languages]) => languages.find(l => l.NameId === language.current)?.IsAllowed ?? true),
        ),
      ]).subscribe(([itemsReadOnly, languageAllowed]) => {
        const readOnly: FormReadOnly = {
          isReadOnly: itemsReadOnly || !languageAllowed,
          reason: itemsReadOnly ? 'Form' : !languageAllowed ? 'Language' : undefined,
        };
        this.readOnly.set(readOnly);
      })
    );
  }

  getFormValid(entityGuid: string) {
    return this.formsValid[entityGuid];
  }

  setFormValid(entityGuid: string, isValid: boolean) {
    this.formsValid[entityGuid] = isValid;

    const allValid = !Object.values(this.formsValid).some(valid => valid === false);
    if (allValid !== this.formsValidTemp()) {
      // if (allValid !== this.formsValid$.value) {
      this.formsValidTemp.set(allValid);
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


interface FormReadOnly {
  isReadOnly: boolean;
  reason: undefined | 'Form' | 'Language';
}
