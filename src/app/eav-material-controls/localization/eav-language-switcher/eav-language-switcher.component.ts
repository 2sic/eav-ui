import { Component, Input } from '@angular/core';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent {
  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  @Input() allControlsAreDisabled: boolean;

  constructor(private languageService: LanguageService) { }

  /**
   * on select tab changed update current language in store
   * @param language
   */
  selectLanguage(language: Language) {
    this.languageService.updateCurrentLanguage(language.key);
  }
}
