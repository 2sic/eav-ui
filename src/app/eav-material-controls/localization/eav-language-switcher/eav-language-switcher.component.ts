import { Component, Input, ViewChild, AfterViewInit, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { MouseScrollService } from './eav-language-switcher-services/mouse-scroll-service';
import { TouchScrollService } from './eav-language-switcher-services/touch-scroll-service';
import { CenterSelectedService } from './eav-language-switcher-services/center-selected-service';
import { ShowShadowsService } from './eav-language-switcher-services/show-shadows-service';
import { LanguageButton, calculateLanguageButtons } from './eav-language-switcher-services/eav-language-switcher.helpers';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollable', { static: false }) headerRef: ElementRef;
  @ViewChild('leftShadow', { static: false }) leftShadowRef: ElementRef;
  @ViewChild('rightShadow', { static: false }) rightShadowRef: ElementRef;
  @Input() languages: Language[];
  @Input() currentLanguage: string;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  languageButtons: LanguageButton[] = [];
  private centerSelectedService: CenterSelectedService;
  private mouseScrollService: MouseScrollService;
  private showShadowsService: ShowShadowsService;
  private touchScrollService: TouchScrollService;

  constructor(
    private languageService: LanguageService,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.languageButtons = calculateLanguageButtons(this.languages);
  }

  ngAfterViewInit() {
    this.showShadowsService = new ShowShadowsService(this.renderer, this.headerRef, this.leftShadowRef, this.rightShadowRef);
    this.mouseScrollService = new MouseScrollService(this.renderer, this.headerRef, this.areButtonsDisabled.bind(this));
    this.touchScrollService = new TouchScrollService(this.renderer, this.headerRef);
    this.centerSelectedService = new CenterSelectedService(this.renderer, this.headerRef);
  }

  areButtonsDisabled(): boolean {
    return !this.formsAreValid && !this.allControlsAreDisabled;
  }

  ngOnDestroy() {
    this.centerSelectedService.destroy();
    this.touchScrollService.destroy();
    this.mouseScrollService.destroy();
    this.showShadowsService.destroy();
  }

  lngButtonMouseDown(event: MouseEvent) {
    this.centerSelectedService.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    this.centerSelectedService.lngButtonClick(event);

    if (!this.centerSelectedService.stopClickIfMouseMoved()) {
      this.languageService.updateCurrentLanguage(language.key);
    }
  }

  headerMouseDown(event: MouseEvent) {
    this.mouseScrollService.headerMouseDown(event);
  }

  headerScroll(event: MouseEvent) {
    this.showShadowsService.headerScroll(event);
  }

  headerTouchStart(event: MouseEvent) {
    this.touchScrollService.headerTouchStart(event);
  }
}
