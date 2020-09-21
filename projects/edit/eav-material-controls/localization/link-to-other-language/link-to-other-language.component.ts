import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { Language } from '../../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { I18nKeyConstants } from './link-to-other-language.constants';
import { findI18nKey, findTranslationLink } from './link-to-other-language.helpers';

@Component({
  selector: 'app-link-to-other-language',
  templateUrl: './link-to-other-language.component.html',
  styleUrls: ['./link-to-other-language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkToOtherLanguageComponent implements OnInit, OnDestroy {
  languages$: Observable<Language[]>;
  selected$: BehaviorSubject<LinkToOtherLanguageData>;
  showLanguages$: BehaviorSubject<boolean>;
  i18nRoot$: BehaviorSubject<string>;
  TranslationLinks = TranslationLinkConstants;
  I18nKeys = I18nKeyConstants;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: LinkToOtherLanguageData,
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
    const newSelected: LinkToOtherLanguageData = { ...this.selected$.value };

    if (!showLanguages) { newSelected.language = ''; }
    newSelected.linkType = findTranslationLink(i18nKey);

    this.showLanguages$.next(showLanguages);
    this.selected$.next(newSelected);
    this.i18nRoot$.next(`LangMenu.Dialog.${i18nKey}`);
  }

  selectLanguage(language: string) {
    this.selected$.next({ ...this.selected$.value, language });
  }

  isOkDisabled(selected: LinkToOtherLanguageData) {
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
