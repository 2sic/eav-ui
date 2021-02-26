import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants';
import { TranslationState } from '../../../shared/models';
import { EavService, FieldsSettingsService, FieldsTranslateService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuTemplateVars } from './translate-menu.models';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
})
export class TranslateMenuComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() private group: FormGroup;

  translationLinkConstants = TranslationLinkConstants;
  templateVars$: Observable<TranslateMenuTemplateVars>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
  ) { }

  ngOnInit(): void {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const translationState$ = this.fieldsSettingsService.getTranslationState$(this.config.fieldName);
    const disableTranslation$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
    );

    const control = this.group.controls[this.config.fieldName];
    const disabled$ = this.eavService.formDisabledChange$.pipe(
      filter(formSet => formSet.formId === this.eavService.eavConfig.formId && formSet.entityGuid === this.config.entityGuid),
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([currentLanguage$, defaultLanguage$, translationState$, disableTranslation$, disabled$]).pipe(
      map(([currentLanguage, defaultLanguage, translationState, disableTranslation, disabled]) => {
        const templateVars: TranslateMenuTemplateVars = {
          currentLanguage,
          defaultLanguage,
          translationState,
          translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
          disableTranslation,
          disabled,
        };
        return templateVars;
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
    const dialogData: TranslateMenuDialogData = {
      config: this.config,
      translationState: {
        language: translationState.language,
        linkType: translationState.linkType,
      },
    };
    this.dialog.open(TranslateMenuDialogComponent, {
      panelClass: 'translate-menu-dialog',
      autoFocus: false,
      width: '350px',
      viewContainerRef: this.viewContainerRef,
      data: dialogData,
    });
  }
}
