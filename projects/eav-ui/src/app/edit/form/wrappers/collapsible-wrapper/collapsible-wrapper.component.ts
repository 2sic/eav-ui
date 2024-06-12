import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { FormConfigService, FieldsSettingsService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet, FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { EmptyDefaultLogic } from './collapsible-wrapper-logic';
import { ItemFieldVisibility } from '../../../shared/services/item-field-visibility';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { ChangeAnchorTargetDirective } from '../../../shared/directives/change-anchor-target.directive';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';

const logThis = true;

@Component({
    selector: WrappersConstants.CollapsibleWrapper,
    templateUrl: './collapsible-wrapper.component.html',
    styleUrls: ['./collapsible-wrapper.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        NgClass,
        ExtendedModule,
        FlexModule,
        MatIconModule,
        ChangeAnchorTargetDirective,
        SharedComponentsModule,
        AsyncPipe,
    ],
})
export class CollapsibleWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;
  
  controlConfig: FieldControlConfig = {};

  visible$: Observable<boolean>;
  collapsed$: BehaviorSubject<boolean>;
  label$: Observable<string>;
  notes$: Observable<string>;

  private settings$: BehaviorSubject<FieldSettings>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
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

    this.visible$ = this.settings$.pipe(map(settings => ItemFieldVisibility.mergedVisible(settings)), distinctUntilChanged());
    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.notes$ = this.settings$.pipe(map(settings => settings.Notes), distinctUntilChanged());

    this.subscription.add(
      this.settings$.pipe(map(settings => settings.Collapsed), distinctUntilChanged()).subscribe(collapsed => {
        this.collapsed$.next(collapsed);
      })
    );

    this.subscription.add(
      this.languageStore.getLanguage$(this.formConfig.config.formId).subscribe(() => {
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
