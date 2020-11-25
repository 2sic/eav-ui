import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslateMenuDialogComponent implements OnInit, OnDestroy {
  translationLinks = TranslationLinkConstants;
  i18nKeys = I18nKeyConstants;
  templateVars$: Observable<TranslateMenuDialogTemplateVars>;

  private translationState$: BehaviorSubject<TranslationState>;
  private noLanguageRequired = [TranslationLinkConstants.Translate, TranslationLinkConstants.DontTranslate];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
  ) { }

  ngOnInit() {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.dialogData.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.dialogData.config.form.formId);
    const attributes$ = this.itemService.selectItemAttributes(this.dialogData.config.entity.entityGuid);
    const languages$ = combineLatest([this.languageService.entities$, currentLanguage$, defaultLanguage$, attributes$]).pipe(
      map(([languages, currentLanguage, defaultLanguage, attributes]) =>
        getTemplateLanguages(this.dialogData.config, currentLanguage, defaultLanguage, languages, attributes)),
    );

    this.translationState$ = new BehaviorSubject({ ...this.dialogData.config.field.fieldHelper.translationState$.value });

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

  ngOnDestroy() {
    this.translationState$.complete();
  }

  setLinkType(linkType: string) {
    const newTranslationState: TranslationState = {
      linkType,
      language: this.noLanguageRequired.includes(linkType) ? '' : this.translationState$.value.language,
    };
    this.translationState$.next(newTranslationState);
  }

  setLanguage(language: string) {
    this.translationState$.next({ ...this.translationState$.value, language });
  }
}
