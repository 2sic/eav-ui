import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { Language } from '../../../shared/models/eav';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { I18nKeyConstants } from './translate-menu-dialog.constants';
import { findI18nKey, findTranslationLink } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData } from './translate-menu-dialog.models';

@Component({
  selector: 'app-translate-menu-dialog',
  templateUrl: './translate-menu-dialog.component.html',
  styleUrls: ['./translate-menu-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateMenuDialogComponent implements OnInit, OnDestroy {
  languages$: Observable<Language[]>;
  selected$: BehaviorSubject<TranslateMenuDialogData>;
  showLanguages$: BehaviorSubject<boolean>;
  i18nRoot$: BehaviorSubject<string>;
  TranslationLinks = TranslationLinkConstants;
  I18nKeys = I18nKeyConstants;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
  ) {
    this.selected$ = new BehaviorSubject({ ...this.dialogData });
    this.showLanguages$ = new BehaviorSubject(this.dialogData.language !== '');

    const i18nKey = findI18nKey(this.dialogData.linkType);
    this.i18nRoot$ = new BehaviorSubject(`LangMenu.Dialog.${i18nKey}`);
  }

  ngOnInit() {
    this.languages$ = combineLatest([
      this.languageService.entities$,
      this.languageInstanceService.getCurrentLanguage(this.dialogData.formId)
    ]).pipe(
      map(([languages, currentLanguage]) => languages.filter(lang => lang.key !== currentLanguage)),
    );
  }

  ngOnDestroy() {
    this.selected$.complete();
    this.showLanguages$.complete();
    this.i18nRoot$.complete();
  }

  select(i18nKey: string) {
    const showLanguages = (i18nKey !== I18nKeyConstants.FromPrimary && i18nKey !== I18nKeyConstants.NoTranslate);
    const newSelected: TranslateMenuDialogData = { ...this.selected$.value };

    if (!showLanguages) { newSelected.language = ''; }
    newSelected.linkType = findTranslationLink(i18nKey);

    this.showLanguages$.next(showLanguages);
    this.selected$.next(newSelected);
    this.i18nRoot$.next(`LangMenu.Dialog.${i18nKey}`);
  }

  selectLanguage(language: string) {
    this.selected$.next({ ...this.selected$.value, language });
  }

  isOkDisabled(selected: TranslateMenuDialogData) {
    const disabled = selected.language === ''
      && selected.linkType !== TranslationLinkConstants.Translate
      && selected.linkType !== TranslationLinkConstants.DontTranslate;
    return disabled;
  }

  isLanguageDisabled(languageKey: string) {
    if (!this.dialogData.attributes) { return true; }

    const hasTranslation = LocalizationHelper.isEditableTranslationExist(
      this.dialogData.attributes[this.dialogData.attributeKey],
      languageKey,
      this.dialogData.defaultLanguage
    );
    return !hasTranslation;
  }
}
