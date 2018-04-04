import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.css']
})
export class EavLanguageSwitcherComponent {
  @Input() languages: Language[];

  currentLanguage$: Observable<string>;

  constructor(private languageService: LanguageService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  /**
   * on select tab changed update current language
   * @param event
   */
  selectedTabChanged(tabChangeEvent: MatTabChangeEvent) {
    const language: Language = this.getLanguageByName(tabChangeEvent.tab.textLabel);
    this.languageService.updateCurrentLanguage(language.key);
  }

  private getLanguageByName = (name): Language => {
    return this.languages.find(d => d.name === name);
  }

  private getLanguage = (key): Language => {
    return this.languages.find(d => d.key === key);
  }
}
