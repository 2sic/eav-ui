import {
  Component, Input, ViewChild, ViewChildren, AfterViewInit, ElementRef, QueryList, Renderer2
} from '@angular/core';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';

import { MouseScrollService } from './eav-language-switcher-services/mouse-scroll-service';
import { TouchScrollService } from './eav-language-switcher-services/touch-scroll-service';
import { CenterSelectedService } from './eav-language-switcher-services/center-selected-service';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent implements AfterViewInit {
  @ViewChild('scrollable') headerRef: ElementRef;
  @ViewChildren('buttons', { read: ElementRef }) buttonsRef: QueryList<ElementRef>;

  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  @Input() allControlsAreDisabled: boolean;

  constructor(
    private languageService: LanguageService,
    private renderer: Renderer2,
    private mouseScrollService: MouseScrollService,
    private touchScrollService: TouchScrollService,
    private centerSelectedService: CenterSelectedService
  ) { }

  ngAfterViewInit() {
    this.mouseScrollService.initMouseScroll(this.renderer, this.headerRef);
    this.touchScrollService.initTouchScroll(this.renderer, this.headerRef);
    this.centerSelectedService.initCenterSelected(this.renderer, this.headerRef, this.buttonsRef);
  }

  /**
   * on select tab changed update current language in store
   * @param language
   */
  selectLanguage(language: Language) {
    this.languageService.updateCurrentLanguage(language.key);
  }
}
