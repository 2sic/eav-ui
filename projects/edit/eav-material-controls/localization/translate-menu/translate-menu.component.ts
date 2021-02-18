import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
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
    private fieldsSettings2NewService: FieldsSettings2NewService,
  ) { }

  ngOnInit(): void {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const translationState$ = this.config.field.fieldHelper.translationState$;
    const disableTranslation$ = this.fieldsSettings2NewService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
    );

    const control = this.group.controls[this.config.fieldName];
    const disabled$ = this.eavService.formDisabledChange$.pipe(
      filter(formSet => formSet.formId === this.eavService.eavConfig.formId && formSet.entityGuid === this.config.entityGuid),
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );
    const defaultLanguageMissingValue$ = this.config.field.fieldHelper.defaultLanguageMissingValue$;
    const infoMessage$ = this.config.field.fieldHelper.translationInfoMessage$;
    const infoMessageLabel$ = this.config.field.fieldHelper.translationInfoMessageLabel$;

    this.templateVars$ = combineLatest([
      combineLatest([currentLanguage$, defaultLanguage$, translationState$, disableTranslation$]),
      combineLatest([disabled$, defaultLanguageMissingValue$, infoMessage$, infoMessageLabel$]),
    ]).pipe(
      map(
        ([
          [currentLanguage, defaultLanguage, translationState, disableTranslation],
          [disabled, defaultLanguageMissingValue, infoMessage, infoMessageLabel],
        ]) => {
          const templateVars: TranslateMenuTemplateVars = {
            currentLanguage,
            defaultLanguage,
            translationState,
            translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
            disableTranslation,
            disabled,
            defaultLanguageMissingValue,
            infoMessage,
            infoMessageLabel,
          };
          return templateVars;
        }
      ),
    );
  }

  translate(): void {
    this.config.field.fieldHelper.translate();
  }

  dontTranslate(): void {
    this.config.field.fieldHelper.dontTranslate();
  }

  openTranslateMenuDialog(): void {
    const dialogData: TranslateMenuDialogData = {
      config: this.config,
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
