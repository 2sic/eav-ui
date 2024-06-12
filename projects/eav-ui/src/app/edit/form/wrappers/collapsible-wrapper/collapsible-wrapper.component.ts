import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject, map } from 'rxjs';
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
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapUntilChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';

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

  /** Collapsed state - will be updated in various scenarios */
  collapsed = signal(false);

  /** Settings, will be filled onInit. Must be subject, so it doesn't start the signals yet. */
  private settings$ = new Subject<FieldSettings>();

  /** The label of the group */
  label = toSignal(this.settings$.pipe(map(s => s.Name)), { initialValue: '' });

  /** Notes / Intro message */
  notes = toSignal(this.settings$.pipe(map(s => s.Notes)), { initialValue: '' });

  /** Visible state */
  visible = toSignal(this.settings$.pipe(map(s => ItemFieldVisibility.mergedVisible(s))), { initialValue: false });

  constructor(
    private fieldsSettingsSvc: FieldsSettingsService,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
  ) {
    super(new EavLogger('CollapsibleWrapper', logThis));
    EmptyDefaultLogic.importMe();
  }

  ngOnInit(): void {
    const fieldSettings$ = this.fieldsSettingsSvc.getFieldSettings$(this.config.fieldName);
    this.subscriptions.add(
      fieldSettings$.subscribe(settings => this.settings$.next(settings))
    );

    // If settings change the collapsed state (e.g. because of formula)
    this.subscriptions.add(
      this.settings$.pipe(mapUntilChanged(settings => settings.Collapsed)).subscribe(collapsed => this.collapsed.set(collapsed))
    );

    // On language change, re-check the initial collapsed state in that language
    this.subscriptions.add(
      this.languageStore.getLanguage$(this.formConfig.config.formId)
        .pipe(mapUntilChanged(l => l.current))
        .subscribe(() => {
          const settingsSnapshot = this.fieldsSettingsSvc.getFieldSettings(this.config.fieldName);
          this.collapsed.set(settingsSnapshot.Collapsed);
    }));
  }

  toggleCollapse(): void {
    this.log.a('toggleCollapse', [{ before: this.collapsed() }])
    this.collapsed.update(prev => !prev);
  }
}
