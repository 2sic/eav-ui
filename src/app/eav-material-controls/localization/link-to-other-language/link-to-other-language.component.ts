import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageService } from '../../../shared/services/language.service';
import { Language } from '../../../shared/models/eav';

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

  constructor(@Inject(MAT_DIALOG_DATA) private data: LinkToOtherLanguageData,
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
    this.selectedOption.linkType = 'translate';
    this.selectedOption.language = '';
    console.log('translate');
  }

  dontTranslate() {
    this.showLanguages = false;
    this.selectedOption.linkType = 'dontTranslate';
    this.selectedOption.language = '';
    console.log('dontTranslate');
  }

  linkReadOnly() {
    this.showLanguages = true;
    this.selectedOption.linkType = 'linkReadOnly';
  }

  linkReadWrite() {
    this.showLanguages = true;
    this.selectedOption.linkType = 'linkReadWrite';
  }


  selectLanguage(lang: string) {
    this.selectedOption.language = lang;
  }

  linkOtherLanguage() {
    console.log(this.selectedOption);
  }

}
