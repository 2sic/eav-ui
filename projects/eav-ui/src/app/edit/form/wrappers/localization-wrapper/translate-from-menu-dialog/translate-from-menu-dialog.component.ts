import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateMenuDialogData, TranslateMenuDialogTemplateVars } from '../translate-menu-dialog/translate-menu-dialog.models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { EavService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService, LanguageService } from '../../../../shared/store/ngrx-data';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { I18nKeys } from '../translate-menu-dialog/translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages, getTemplateLanguagesWithContent } from '../translate-menu-dialog/translate-menu-dialog.helpers';
import { MatSnackBar} from '@angular/material/snack-bar';
import { SnackBarWarningDemoComponent } from '../snack-bar-warning-demo/snack-bar-warning-demo.component';

@Component({
  selector: 'app-translate-from-menu-dialog',
  templateUrl: './translate-from-menu-dialog.component.html',
  styleUrls: ['./translate-from-menu-dialog.component.scss'],
})
export class TranslateFromMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  templateVars$: Observable<TranslateMenuDialogTemplateVars>;

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private noLanguageRequired: TranslationLink[];

  constructor(
    private dialogRef: MatDialogRef<TranslateFromMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsTranslateService: FieldsTranslateService,
    private snackBar: MatSnackBar,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit(): void {
    this.snackBar.openFromComponent(SnackBarWarningDemoComponent);
    this.dialogRef.afterClosed().subscribe(() => { 
      this.snackBar.dismiss();
    });

    this.translationState$ = new BehaviorSubject(this.dialogData.translationState);
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];

    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const attributes$ = this.itemService.getItemAttributes$(this.dialogData.config.entityGuid);
    const languages$ = combineLatest([
      this.languageService.getLanguages$(),
      currentLanguage$,
      defaultLanguage$,
      attributes$,
      this.translationState$,
    ]).pipe(
      map(([languages, currentLanguage, defaultLanguage, attributes, translationState]) => {
        return this.dialogData.isTranslateMany ? getTemplateLanguagesWithContent(currentLanguage, defaultLanguage, languages, attributes, translationState.linkType, this.dialogData.translatableFields)
          : getTemplateLanguages(this.dialogData.config, currentLanguage, defaultLanguage, languages, attributes, translationState.linkType);
      }),
    );

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

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationState$.value, language };
    this.translationState$.next(newTranslationState);

    const oldState = this.dialogData.translationState;
    const isEqual = oldState.language === newTranslationState.language;
    if (isEqual) {
      this.closeDialog();
      return;
    }

    this.dialogData.isTranslateMany ? this.fieldsTranslateService.translateFromManyWithContent(newTranslationState.language)
      : this.fieldsTranslateService.translateFrom(this.dialogData.config.name, newTranslationState.language, true);

    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}