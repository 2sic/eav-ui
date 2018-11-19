import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageService } from '../../../shared/services/language.service';
import { Language } from '../../../shared/models/eav';
import { TranslationLinkTypeConstants } from '../../../shared/constants/type-constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';

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

  private subscriptions: Subscription[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: LinkToOtherLanguageData,
    private languageService: LanguageService) {
    this.selectedOption = this.data;
  }

  ngOnInit() {
    console.log('this.selectedOption', this.selectedOption);
    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
  * Load languages from store and subscribe to languages
  */
  private loadlanguagesFromStore() {
    this.languages$ = this.languageService.selectAllLanguages();

    this.subscriptions.push(
      this.languages$.subscribe(languages => {
        this.languages = languages;
      })
    );
  }


  translate() {
    this.showLanguages = false;
    this.selectedOption.linkType = TranslationLinkTypeConstants.translate;
    this.selectedOption.language = '';
  }

  dontTranslate() {
    this.showLanguages = false;
    this.selectedOption.linkType = TranslationLinkTypeConstants.dontTranslate;
    this.selectedOption.language = '';
  }

  linkReadOnly() {
    this.showLanguages = true;
    this.selectedOption.linkType = TranslationLinkTypeConstants.linkReadOnly;
  }

  linkReadWrite() {
    this.showLanguages = true;
    this.selectedOption.linkType = TranslationLinkTypeConstants.linkReadWrite;
  }

  linkCopyFrom() {
    this.showLanguages = true;
    this.selectedOption.linkType = TranslationLinkTypeConstants.linkCopyFrom;
  }

  selectLanguage(lang: string) {
    this.selectedOption.language = lang;
  }

  okButtonDisabled() {
    if (this.selectedOption.language === '' &&
      this.selectedOption.linkType !== TranslationLinkTypeConstants.translate &&
      this.selectedOption.linkType !== TranslationLinkTypeConstants.dontTranslate) {
      return true;
    } else {
      return false;
    }
  }

  linkOtherLanguage() {
    console.log(this.selectedOption);
  }

  hasLanguage = (languageKey) => {
    return this.data.attributes
      ? LocalizationHelper.isEditableOrReadonlyTranslationExist(this.data.attributes[this.data.attributeKey],
        languageKey, this.data.defaultLanguage)
      : false;
  }
}
