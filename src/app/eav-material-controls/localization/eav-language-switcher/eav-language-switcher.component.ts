import { Component, Input, ViewChild, AfterViewInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { MouseScrollService } from './eav-language-switcher-services/mouse-scroll-service';
import { TouchScrollService } from './eav-language-switcher-services/touch-scroll-service';
import { CenterSelectedService } from './eav-language-switcher-services/center-selected-service';
import { ShowShadowsService } from './eav-language-switcher-services/show-shadows-service';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollable') headerRef: ElementRef;
  @ViewChild('leftShadow') leftShadowRef: ElementRef;
  @ViewChild('rightShadow') rightShadowRef: ElementRef;
  @Input() languages: Language[];
  @Input() currentLanguage: string;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  private centerSelectedService: CenterSelectedService;
  private mouseScrollService: MouseScrollService;
  private showShadowsService: ShowShadowsService;
  private touchScrollService: TouchScrollService;

  constructor(
    private languageService: LanguageService,
    private renderer: Renderer2,
  ) {
    this.showShadowsService = new ShowShadowsService();
    this.mouseScrollService = new MouseScrollService();
    this.touchScrollService = new TouchScrollService();
    this.centerSelectedService = new CenterSelectedService();
  }

  ngAfterViewInit() {
    this.showShadowsService.initShadowsCalculation(this.renderer, this.headerRef, this.leftShadowRef, this.rightShadowRef);
    this.mouseScrollService.initMouseScroll(this.renderer, this.headerRef, this.areButtonsDisabled.bind(this));
    this.touchScrollService.initTouchScroll(this.renderer, this.headerRef);
    this.centerSelectedService.initCenterSelected(this.renderer, this.headerRef);
  }

  lngButtonDown(event: MouseEvent) {
    this.centerSelectedService.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    this.centerSelectedService.lngButtonClick(event);

    if (!this.centerSelectedService.stopClickIfMouseMoved()) {
      this.languageService.updateCurrentLanguage(language.key);
    }
  }

  scrollableDown(event: MouseEvent) {
    this.mouseScrollService.scrollableDown(event);
  }

  scrollableScroll(event: MouseEvent) {
    this.showShadowsService.scrollableScroll(event);
  }

  areButtonsDisabled(): boolean {
    return !this.formsAreValid && !this.allControlsAreDisabled;
  }

  ngOnDestroy() {
    this.centerSelectedService.destroy();
    this.mouseScrollService.destroy();
    this.showShadowsService.destroy();
  }
}
