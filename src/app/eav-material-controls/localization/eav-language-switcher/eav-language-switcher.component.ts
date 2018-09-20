import { Component, Input } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.css']
})
export class EavLanguageSwitcherComponent {
  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  constructor(private languageService: LanguageService) {
    // this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  /**
   * on select tab changed update current language in store
   * @param event
   */
  selectedTabChanged(tabChangeEvent: MatTabChangeEvent) {
    const language: Language = this.getLanguageByName(tabChangeEvent.tab.textLabel);
    this.languageService.updateCurrentLanguage(language.key);
  }

  private getLanguageByName = (name): Language => {
    return this.languages.find(d => d.name.startsWith(name));
  }

  private getLanguage = (key): Language => {
    return this.languages.find(d => d.key === key);
  }
}
