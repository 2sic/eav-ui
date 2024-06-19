import { Component, inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { TranslationLinks } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';
import { FormConfigService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AutoTranslateDisabledWarningDialog } from '../auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuViewModel } from './translate-menu.models';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    NgClass,
    ExtendedModule,
    SharedComponentsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FeatureIconIndicatorComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class TranslateMenuComponent implements OnInit {
  @Input() hideTranslateButton: boolean;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  protected group = this.fieldState.group;


  TranslationLinks = TranslationLinks;
  viewModel$: Observable<TranslateMenuViewModel>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
    private fieldSettings: FieldsSettingsService,
    private fieldsTranslate: FieldsTranslateService,
    private formsState: FormsStateService,
  ) { }

  ngOnInit(): void {
    const readOnly$ = this.formsState.readOnly$;
    const language$ = this.languageStore.getLanguage$(this.formConfig.config.formId);
    const translationState$ = this.fieldSettings.getTranslationState$(this.config.fieldName);
    const disableTranslation$ = this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
      distinctUntilChanged(),
    );
    const disableAutoTranslation$ = this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableAutoTranslation),
      distinctUntilChanged(),
    );

    const control = this.group.controls[this.config.fieldName];
    const disabled$ = control.valueChanges.pipe(
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      readOnly$, language$, translationState$, disableTranslation$, disableAutoTranslation$, disabled$,
    ]).pipe(
      map(([readOnly, language, translationState, disableTranslation, disableAutoTranslation, disabled]) => {
        const disableTranslateButton = readOnly.isReadOnly || disableTranslation;
        const viewModel: TranslateMenuViewModel = {
          ...language,
          translationState,
          translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
          disableAutoTranslation,
          disabled,

          disableTranslateButton,
        };
        return viewModel;
      }),
    );
  }

  translate(): void {
    this.fieldsTranslate.translate(this.config.name);
  }

  dontTranslate(): void {
    this.fieldsTranslate.dontTranslate(this.config.name);
  }

  openTranslateMenuDialog(translationState: TranslationState): void {
    this.openDialog(translationState, TranslateMenuDialogComponent);
  }

  openAutoTranslateMenuDialog(translationState: TranslationState): void {
    if (this.fieldSettings.getFieldSettings(this.config.fieldName).DisableAutoTranslation) {
      this.dialog.open(AutoTranslateDisabledWarningDialog, {
        autoFocus: false,
        data: { isAutoTranslateAll: false },
        viewContainerRef: this.viewContainerRef,
        width: '350px',
      });
    } else {
      this.openDialog(translationState, AutoTranslateMenuDialogComponent);
    }

  }

  private openDialog(translationState: TranslationState, component: any): void {
    const dialogData: TranslateMenuDialogData = {
      config: this.config,
      translationState: {
        language: translationState.language,
        linkType: translationState.linkType,
      },
    };
    this.dialog.open(component, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef: this.viewContainerRef,
      width: '400px',
    });
  }
}
