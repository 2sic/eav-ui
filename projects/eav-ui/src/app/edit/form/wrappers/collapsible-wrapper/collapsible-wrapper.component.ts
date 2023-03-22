import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { BehaviorSubject, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';

@Component({
  selector: WrappersConstants.CollapsibleWrapper,
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
})
export class CollapsibleWrapperComponent extends BaseSubsinkComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  visible$: Observable<boolean>;
  collapsed$: BehaviorSubject<boolean>;
  label$: Observable<string>;
  notes$: Observable<string>;

  private settings$: BehaviorSubject<FieldSettings>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
  ) {
    super();
    EmptyDefaultLogic.importMe();
  }

  ngOnInit(): void {
    this.collapsed$ = new BehaviorSubject(false);
    this.settings$ = new BehaviorSubject(null);

    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );

    this.visible$ = this.settings$.pipe(map(settings => settings.Visible), distinctUntilChanged());
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
    super.ngOnDestroy();
  }

  toggleCollapse(): void {
    this.collapsed$.next(!this.collapsed$.value);
  }
}
