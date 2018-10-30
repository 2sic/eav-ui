import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';

@Component({
  selector: 'app-link-to-other-language',
  templateUrl: './link-to-other-language.component.html',
  styleUrls: ['./link-to-other-language.component.scss']
})
export class LinkToOtherLanguageComponent implements OnInit {

  showLanguages = false;
  selectedOption: LinkToOtherLanguageData;

  constructor(@Inject(MAT_DIALOG_DATA) private data: LinkToOtherLanguageData) {
    this.selectedOption = this.data;
  }

  ngOnInit() {
    console.log('this.selectedOption', this.selectedOption);
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
