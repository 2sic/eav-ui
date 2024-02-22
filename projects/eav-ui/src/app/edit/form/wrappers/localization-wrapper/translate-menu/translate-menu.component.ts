import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { TranslationLinks } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';
import { EavService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AutoTranslateDisabledWarningDialog } from '../auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuViewModel } from './translate-menu.models';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
})
export class TranslateMenuComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;
  @Input() hideTranslateButton: boolean;

  TranslationLinks = TranslationLinks;
  viewModel$: Observable<TranslateMenuViewModel>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
    private formsStateService: FormsStateService,
  ) { }

  ngOnInit(): void {
    const readOnly$ = this.formsStateService.readOnly$;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const translationState$ = this.fieldsSettingsService.getTranslationState$(this.config.fieldName);
    const disableTranslation$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
      distinctUntilChanged(),
    );
    const disableAutoTranslation$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
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
      readOnly$, currentLanguage$, defaultLanguage$, translationState$, disableTranslation$, disableAutoTranslation$, disabled$,
    ]).pipe(
      map(([readOnly, currentLanguage, defaultLanguage, translationState, disableTranslation, disableAutoTranslation, disabled]) => {
        const disableTranslateButton = readOnly.isReadOnly || disableTranslation;
        const viewModel: TranslateMenuViewModel = {
          currentLanguage,
          defaultLanguage,
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
    this.fieldsTranslateService.translate(this.config.name);
  }

  dontTranslate(): void {
    this.fieldsTranslateService.dontTranslate(this.config.name);
  }

  openTranslateMenuDialog(translationState: TranslationState): void {
    this.openDialog(translationState, TranslateMenuDialogComponent);
  }

  openAutoTranslateMenuDialog(translationState: TranslationState): void {
    if (this.fieldsSettingsService.getFieldSettings(this.config.fieldName).DisableAutoTranslation) {
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
