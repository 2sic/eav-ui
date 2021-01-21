import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { TranslationState } from '../translate-menu/translate-menu.models';
import { I18nKeyConstants } from './translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogTemplateVars } from './translate-menu-dialog.models';

@Component({
  selector: 'app-translate-menu-dialog',
  templateUrl: './translate-menu-dialog.component.html',
  styleUrls: ['./translate-menu-dialog.component.scss'],
})
export class TranslateMenuDialogComponent implements OnInit, OnDestroy {
  translationLinks = TranslationLinkConstants;
  i18nKeys = I18nKeyConstants;
  templateVars$: Observable<TranslateMenuDialogTemplateVars>;

  private translationState$: BehaviorSubject<TranslationState>;
  private noLanguageRequired = [TranslationLinkConstants.Translate, TranslationLinkConstants.DontTranslate];

  constructor(
    private dialogRef: MatDialogRef<TranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private formulaInstance: FormulaInstanceService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit(): void {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.dialogData.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.dialogData.config.form.formId);
    const attributes$ = this.itemService.selectItemAttributes(this.dialogData.config.entity.entityGuid);
    const languages$ = combineLatest([this.languageService.entities$, currentLanguage$, defaultLanguage$, attributes$]).pipe(
      map(([languages, currentLanguage, defaultLanguage, attributes]) =>
        getTemplateLanguages(this.dialogData.config, currentLanguage, defaultLanguage, languages, attributes)),
    );

    const translationStateCopy: TranslationState = { ...this.dialogData.config.field.fieldHelper.translationState$.value };
    this.translationState$ = new BehaviorSubject(translationStateCopy);

    this.templateVars$ = combineLatest([defaultLanguage$, languages$, this.translationState$]).pipe(
      map(([defaultLanguage, languages, translationState]) => {
        const templateVars: TranslateMenuDialogTemplateVars = {
          defaultLanguage,
          languages,
          translationState,
          showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
          i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
          submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.translationState$.complete();
  }

  setLinkType(linkType: string): void {
    const newTranslationState: TranslationState = {
      linkType,
      language: this.noLanguageRequired.includes(linkType) ? '' : this.translationState$.value.language,
    };
    this.translationState$.next(newTranslationState);
  }

  setLanguage(language: string): void {
    const newTranslationState: TranslationState = { ...this.translationState$.value, language };
    this.translationState$.next(newTranslationState);
  }

  save(): void {
    const newState = this.translationState$.value;
    const oldState = this.dialogData.config.field.fieldHelper.translationState$.value;

    const isEqual = oldState.linkType === newState.linkType && oldState.language === newState.language;
    if (isEqual) {
      this.closeDialog();
      return;
    }

    switch (newState.linkType) {
      case TranslationLinkConstants.Translate:
        this.dialogData.config.field.fieldHelper.translate(this.formulaInstance);
        break;
      case TranslationLinkConstants.DontTranslate:
        this.dialogData.config.field.fieldHelper.dontTranslate(this.formulaInstance);
        break;
      case TranslationLinkConstants.LinkReadOnly:
        this.dialogData.config.field.fieldHelper.linkReadOnly(this.formulaInstance, newState.language);
        break;
      case TranslationLinkConstants.LinkReadWrite:
        this.dialogData.config.field.fieldHelper.linkReadWrite(this.formulaInstance, newState.language);
        break;
      case TranslationLinkConstants.LinkCopyFrom:
        this.dialogData.config.field.fieldHelper.copyFrom(this.formulaInstance, newState.language);
        break;
      default:
        break;
    }
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
