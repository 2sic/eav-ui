import {
  Component, Input, ViewChild, ViewChildren, AfterViewInit, ElementRef, QueryList, Renderer2
} from '@angular/core';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';

import { LangSwitchHelper } from './eav-language-switcher.helper';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent implements AfterViewInit {
  @ViewChild('scrollable') headerRef: ElementRef;
  @ViewChildren('buttons') buttonsRef: QueryList<ElementRef>;

  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  @Input() allControlsAreDisabled: boolean;

  constructor(private languageService: LanguageService, private renderer: Renderer2) { }

  ngAfterViewInit() {
    const langSwitchHelper: LangSwitchHelper = new LangSwitchHelper;
    langSwitchHelper.initCenterSelected(this.renderer, this.headerRef, this.buttonsRef);
    langSwitchHelper.initMouseScroll(this.renderer, this.headerRef);
    langSwitchHelper.initTouchScroll(this.renderer, this.headerRef);
  }

  /**
   * on select tab changed update current language in store
   * @param language
   */
  selectLanguage(language: Language) {
    this.languageService.updateCurrentLanguage(language.key);
  }
}
