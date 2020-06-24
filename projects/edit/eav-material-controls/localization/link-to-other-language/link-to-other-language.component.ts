import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { Language } from '../../../shared/models/eav';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-link-to-other-language',
  templateUrl: './link-to-other-language.component.html',
  styleUrls: ['./link-to-other-language.component.scss']
})
export class LinkToOtherLanguageComponent implements OnInit, OnDestroy {
  showLanguages = false;
  selectedOption: LinkToOtherLanguageData;

  languages$: Observable<Language[]>;
  languages: Language[];
  currentLanguage$: Observable<string>;
  currentLanguage = '';

  /** key to translation root of the currently selected option */
  languageList18nRoot = '';

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LinkToOtherLanguageData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
  ) {
    this.selectedOption = this.data;
  }

  ngOnInit() {
    angularConsoleLog('this.selectedOption', this.selectedOption);
    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * Load languages from store and subscribe to languages
   */
  private loadlanguagesFromStore() {
    this.languages$ = this.languageService.entities$;
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.data.formId);

    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
      }),
      this.languages$.subscribe(languages => {
        this.languages = languages.filter(lang => lang.key !== this.currentLanguage);
      })
    );
  }

  select(i18nKey: string) {
    this.showLanguages = !(
      i18nKey === 'FromPrimary' || i18nKey === 'NoTranslate'
    );
    if (!this.showLanguages) {
      this.selectedOption.language = '';
    }

    switch (i18nKey) {
      case 'FromPrimary':
        this.selectedOption.linkType = TranslationLinkConstants.Translate;
        break;
      case 'NoTranslate':
        this.selectedOption.linkType =
          TranslationLinkConstants.DontTranslate;
        break;
      case 'LinkReadOnly':
        this.selectedOption.linkType =
          TranslationLinkConstants.LinkReadOnly;
        break;
      case 'LinkShared':
        this.selectedOption.linkType =
          TranslationLinkConstants.LinkReadWrite;
        break;
      case 'FromOther':
        this.selectedOption.linkType =
          TranslationLinkConstants.LinkCopyFrom;
        break;
    }
    this.languageList18nRoot = 'LangMenu.Dialog.' + i18nKey;
  }

  selectLanguage(lang: string) {
    this.selectedOption.language = lang;
  }

  okButtonDisabled() {
    return (
      this.selectedOption.language === '' &&
      this.selectedOption.linkType !== TranslationLinkConstants.Translate &&
      this.selectedOption.linkType !==
      TranslationLinkConstants.DontTranslate
    );
  }

  linkOtherLanguage() {
    angularConsoleLog(this.selectedOption);
  }

  disableLanguage(languageKey: string): boolean {
    const isCurrentLanguage = languageKey === this.currentLanguage;
    if (isCurrentLanguage) {
      return true;
    }

    const hasTranslation = this.hasTranslation(languageKey);
    if (!hasTranslation) {
      return true;
    }

    return false;
  }

  hasTranslation(languageKey: string): boolean {
    return this.data.attributes
      ? LocalizationHelper.isEditableTranslationExist(
        this.data.attributes[this.data.attributeKey],
        languageKey,
        this.data.defaultLanguage
      )
      : false;
  }
}
