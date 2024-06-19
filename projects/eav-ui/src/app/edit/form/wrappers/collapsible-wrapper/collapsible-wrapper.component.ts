import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject, map } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { FieldsSettingsService } from '../../../shared/services';
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
import { FieldState } from '../../builder/fields-builder/field-state';

const logThis = false;
const nameOfThis = 'CollapsibleWrapperComponent'

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

  protected fieldState = inject(FieldState);
  // protected config = this.fieldState.config;
  // protected group = this.fieldState.group;


  controlConfig: FieldControlConfig = {};

  //
  // Wait, This is the outer one and has a delay so that the control is empty first
  //

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
    // reactivate in case we want to detect language change here
    // private languageStore: LanguageInstanceService,
    // private formConfig: FormConfigService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
    EmptyDefaultLogic.importMe();

    // temp, must be in constructor
    const eff = effect(() => {
      this.log.a('effect change', [{ collapsed: this.collapsed() }]);
    });

  }

  ngOnInit(): void {
    // If settings change the collapsed state (e.g. because of formula)
    // Must happen before adding the first settings so it triggers with that
    this.subscriptions.add(
      this.settings$.pipe(
        mapUntilChanged(settings => settings.Collapsed),
      )
        .subscribe(newCollapsed => {
          const before = this.collapsed();
          this.log.a('settings$.collapsed', [{ before, newCollapsed }]);
          this.collapsed.set(newCollapsed);
        })
    );

    const fieldSettings$ = this.fieldsSettingsSvc.getFieldSettings$(this.config.fieldName);
    this.subscriptions.add(
      fieldSettings$.subscribe(settings => this.settings$.next(settings))
    );

    // 2024-06-12 2dm - I think this is not needed, as switching languages could preserve collapsed state...
    // ...but must monitor and maybe reenable
    // ...if I reenable, I must be sure it doesn't re-collapse when it shouldn't - eg. when selecting a dropdown value...
    // // On language change, re-check the initial collapsed state in that language
    // this.subscriptions.add(
    //   this.languageStore.getLanguage$(this.formConfig.config.formId)
    //     .pipe(mapUntilChanged(l => l.current))
    //     .subscribe(langCurrent => {
    //       const snapShot = this.fieldsSettingsSvc.getFieldSettings(this.config.fieldName);
    //       this.log.a('2dm changed language, will reset collapsed: ', [langCurrent, snapShot.Collapsed]);
    //       this.collapsed.set(snapShot.Collapsed);
    // }));

  }

  toggleCollapse(): void {
    this.log.a('toggleCollapse', [{ before: this.collapsed() }])
    this.collapsed.update(prev => !prev);
  }
}
