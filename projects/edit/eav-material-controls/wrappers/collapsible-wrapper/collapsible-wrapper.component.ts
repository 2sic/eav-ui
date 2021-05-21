import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  visibleInEditUI$: Observable<boolean>;
  collapsed$: BehaviorSubject<boolean>;
  label$: Observable<string>;
  notes$: Observable<string>;

  private settings$: BehaviorSubject<FieldSettings>;
  private subscription: Subscription;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
  ) {
    EmptyDefaultLogic.importMe();
  }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.collapsed$ = new BehaviorSubject(false);
    this.settings$ = new BehaviorSubject(null);

    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );

    this.visibleInEditUI$ = this.settings$.pipe(map(settings => settings.VisibleInEditUI), distinctUntilChanged());
    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.notes$ = this.settings$.pipe(map(settings => settings.Notes), distinctUntilChanged());

    this.subscription.add(
      this.settings$.pipe(map(settings => settings.Collapsed), distinctUntilChanged()).subscribe(collapsed => {
        this.collapsed$.next(collapsed);
      })
    );

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId).subscribe(() => {
        const settingsSnapshot = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
        this.collapsed$.next(settingsSnapshot.Collapsed);
      })
    );
  }

  ngOnDestroy(): void {
    this.settings$.complete();
    this.collapsed$.complete();
    this.subscription.unsubscribe();
  }

  toggleCollapse(): void {
    this.collapsed$.next(!this.collapsed$.value);
  }
}
