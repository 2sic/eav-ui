import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Language } from '../../../shared/models/eav';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { CenterSelectedHelper } from './center-selected.helper';
import { getLanguageButtons, LanguageButton } from './language-switcher.helpers';
import { MouseScrollHelper } from './mouse-scroll.helper';
import { ShowShadowsHelper } from './show-shadows.helper';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollable') private headerRef: ElementRef;
  @ViewChild('leftShadow') private leftShadowRef: ElementRef;
  @ViewChild('rightShadow') private rightShadowRef: ElementRef;
  @Input() private formId: number;
  @Input() disabled: boolean;

  languageButtons$: Observable<LanguageButton[]>;
  currentLanguage$: Observable<string>;

  private centerSelectedHelper: CenterSelectedHelper;
  private mouseScrollHelper: MouseScrollHelper;
  private showShadowsHelper: ShowShadowsHelper;

  constructor(
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.languageButtons$ = this.languageService.entities$.pipe(map(langs => getLanguageButtons(langs)));
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.formId);
  }

  ngAfterViewInit() {
    this.showShadowsHelper = new ShowShadowsHelper(this.ngZone, this.headerRef.nativeElement,
      this.leftShadowRef.nativeElement, this.rightShadowRef.nativeElement);
    this.mouseScrollHelper = new MouseScrollHelper(this.ngZone, this.headerRef.nativeElement, this.areButtonsDisabled.bind(this));
    this.centerSelectedHelper = new CenterSelectedHelper(this.ngZone, this.headerRef.nativeElement);
  }

  ngOnDestroy() {
    this.centerSelectedHelper.destroy();
    this.mouseScrollHelper.destroy();
    this.showShadowsHelper.destroy();
  }

  lngButtonMouseDown(event: MouseEvent) {
    this.centerSelectedHelper.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    if (this.disabled) { return; }
    this.centerSelectedHelper.lngButtonClick(event);

    if (!this.centerSelectedHelper.stopClickIfMouseMoved()) {
      this.languageInstanceService.updateCurrentLanguage(this.formId, language.key);
    }
  }

  private areButtonsDisabled() {
    return this.disabled;
  }
}
