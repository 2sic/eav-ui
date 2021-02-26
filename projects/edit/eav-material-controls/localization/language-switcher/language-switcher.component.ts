import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Language } from '../../../shared/models';
import { EavService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { CenterSelectedHelper } from './center-selected.helper';
import { getLanguageButtons } from './language-switcher.helpers';
import { LanguageSwitcherTemplateVars } from './language-switcher.models';
import { MouseScrollHelper } from './mouse-scroll.helper';
import { ShowShadowsHelper } from './show-shadows.helper';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollable') private headerRef: ElementRef;
  @ViewChild('leftShadow') private leftShadowRef: ElementRef;
  @ViewChild('rightShadow') private rightShadowRef: ElementRef;
  @Input() disabled: boolean;

  templateVars$: Observable<LanguageSwitcherTemplateVars>;

  private centerSelectedHelper: CenterSelectedHelper;
  private mouseScrollHelper: MouseScrollHelper;
  private showShadowsHelper: ShowShadowsHelper;

  constructor(
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private ngZone: NgZone,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const languageButtons$ = this.languageService.getLanguages$().pipe(map(langs => getLanguageButtons(langs)));

    this.templateVars$ = combineLatest([currentLanguage$, languageButtons$]).pipe(
      map(([currentLanguage, languageButtons]) => {
        const templateVars: LanguageSwitcherTemplateVars = {
          currentLanguage,
          languageButtons,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    this.showShadowsHelper = new ShowShadowsHelper(
      this.ngZone,
      this.headerRef.nativeElement,
      this.leftShadowRef.nativeElement,
      this.rightShadowRef.nativeElement,
    );
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
      this.languageInstanceService.setCurrentLanguage(this.eavService.eavConfig.formId, language.key);
    }
  }

  private areButtonsDisabled() {
    return this.disabled;
  }
}
