import { Component, Input, ViewChild, AfterViewInit, ElementRef, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { MouseScrollHelper } from './eav-language-switcher-services/mouse-scroll-helper';
import { TouchScrollHelper } from './eav-language-switcher-services/touch-scroll-helper';
import { CenterSelectedService } from './eav-language-switcher-services/center-selected-service';
import { ShowShadowsHelper } from './eav-language-switcher-services/show-shadows-helper';
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
  @Input() formId: number;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  private subscriptions: Subscription[] = [];
  languages: Language[];
  currentLanguage: string;
  languageButtons: LanguageButton[] = [];
  private centerSelectedService: CenterSelectedService;
  private mouseScrollHelper: MouseScrollHelper;
  private showShadowsService: ShowShadowsHelper;
  private touchScrollHelper: TouchScrollHelper;

  constructor(
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.languageService.entities$.subscribe(languages => { this.languages = languages; }),
      this.languageInstanceService.getCurrentLanguage(this.formId).subscribe(currentLang => { this.currentLanguage = currentLang; }),
    );
    this.languageButtons = calculateLanguageButtons(this.languages);
  }

  ngAfterViewInit() {
    this.showShadowsService = new ShowShadowsHelper(this.ngZone, this.headerRef.nativeElement,
      this.leftShadowRef.nativeElement, this.rightShadowRef.nativeElement);
    this.showShadowsService.init();
    this.mouseScrollHelper = new MouseScrollHelper(this.ngZone, this.headerRef.nativeElement, this.areButtonsDisabled.bind(this));
    this.mouseScrollHelper.init();
    this.touchScrollHelper = new TouchScrollHelper(this.ngZone, this.headerRef.nativeElement, this.areButtonsDisabled.bind(this));
    this.touchScrollHelper.init();
    this.centerSelectedService = new CenterSelectedService(this.ngZone, this.headerRef.nativeElement);
    this.centerSelectedService.init();
  }

  areButtonsDisabled(): boolean {
    return !this.formsAreValid && !this.allControlsAreDisabled;
  }

  ngOnDestroy() {
    this.centerSelectedService.destroy();
    this.touchScrollHelper.destroy();
    this.mouseScrollHelper.destroy();
    this.showShadowsService.destroy();
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  lngButtonMouseDown(event: MouseEvent) {
    this.centerSelectedService.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    this.centerSelectedService.lngButtonClick(event);

    if (!this.centerSelectedService.stopClickIfMouseMoved()) {
      this.languageInstanceService.updateCurrentLanguage(this.formId, language.key);
    }
  }
}
