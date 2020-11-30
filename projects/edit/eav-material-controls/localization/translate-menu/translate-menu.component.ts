import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { EavService } from '../../../shared/services/eav.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
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
    private formulaInstance: FormulaInstanceService,
  ) { }

  ngOnInit(): void {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    const translationState$ = this.config.field.fieldHelper.translationState$;

    const control = this.group.controls[this.config.field.name];
    const disabled$ = this.eavService.formDisabledChange$.pipe(
      filter(formSet => formSet.formId === this.config.form.formId && formSet.entityGuid === this.config.entity.entityGuid),
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );
    const defaultLanguageMissingValue$ = this.config.field.fieldHelper.defaultLanguageMissingValue$;
    const infoMessage$ = this.config.field.fieldHelper.translationInfoMessage$;
    const infoMessageLabel$ = this.config.field.fieldHelper.translationInfoMessageLabel$;

    this.templateVars$ = combineLatest([
      combineLatest([currentLanguage$, defaultLanguage$, translationState$]),
      combineLatest([disabled$, defaultLanguageMissingValue$, infoMessage$, infoMessageLabel$]),
    ]).pipe(
      map(
        ([
          [currentLanguage, defaultLanguage, translationState],
          [disabled, defaultLanguageMissingValue, infoMessage, infoMessageLabel],
        ]) => {
          const templateVars: TranslateMenuTemplateVars = {
            currentLanguage,
            defaultLanguage,
            translationState,
            translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
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
    this.config.field.fieldHelper.translate(this.formulaInstance);
  }

  dontTranslate(): void {
    this.config.field.fieldHelper.dontTranslate(this.formulaInstance);
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
