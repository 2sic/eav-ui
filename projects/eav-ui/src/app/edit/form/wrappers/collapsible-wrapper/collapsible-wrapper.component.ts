import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject, distinctUntilChanged, map } from 'rxjs';
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
  collapsedSig = signal(false);

  private settings$ = new Subject<FieldSettings>();

  label = toSignal(this.settings$.pipe(map(s => s.Name)), { initialValue: '' });
  notes = toSignal(this.settings$.pipe(map(s => s.Notes)), { initialValue: '' });
  visible = toSignal(this.settings$.pipe(map(s => ItemFieldVisibility.mergedVisible(s))), { initialValue: false });


  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
  ) {
    super(new EavLogger('CollapsibleWrapper', logThis));
    EmptyDefaultLogic.importMe();
  }

  ngOnInit(): void {
    const fieldSettings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName);
    this.subscriptions.add(
      fieldSettings$.subscribe(settings => this.settings$.next(settings))
    );

    this.subscriptions.add(
      this.settings$.pipe(
        map(settings => settings.Collapsed),
        distinctUntilChanged()
      ).subscribe(collapsed => {
        this.collapsedSig.set(collapsed);
      })
    );

    // On language change, re-check the initial collapsed state in that language
    this.subscriptions.add(
      this.languageStore.getLanguage$(this.formConfig.config.formId).pipe(
        map(l => l.current),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        const settingsSnapshot = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
        this.collapsedSig.set(settingsSnapshot.Collapsed);
      })
    );
  }

  toggleCollapse(): void {
    this.log.a('toggleCollapse', [{ before: this.collapsedSig() }])
    this.collapsedSig.update(prev => !prev);
  }
}
