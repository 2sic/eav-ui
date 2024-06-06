import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Language } from '../../../shared/models';
import { EavService } from '../../../shared/services';
import { LanguageInstanceService, LanguageService } from '../../../shared/store/ngrx-data';
import { CenterSelectedHelper } from './center-selected.helper';
import { getLanguageButtons } from './language-switcher.helpers';
import { LanguageSwitcherViewModel } from './language-switcher.models';
import { MouseScrollHelper } from './mouse-scroll.helper';
import { ShowShadowsHelper } from './show-shadows.helper';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';

@Component({
    selector: 'app-language-switcher',
    templateUrl: './language-switcher.component.html',
    styleUrls: ['./language-switcher.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
        MatButtonModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class LanguageSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollable') private headerRef: ElementRef;
  @ViewChild('leftShadow') private leftShadowRef: ElementRef;
  @ViewChild('rightShadow') private rightShadowRef: ElementRef;
  @Input() disabled: boolean;

  viewModel$: Observable<LanguageSwitcherViewModel>;

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

    this.viewModel$ = combineLatest([currentLanguage$, languageButtons$]).pipe(
      map(([currentLanguage, languageButtons]) => {
        const viewModel: LanguageSwitcherViewModel = {
          currentLanguage,
          languageButtons,
        };
        return viewModel;
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
      this.languageInstanceService.setCurrentLanguage(this.eavService.eavConfig.formId, language.NameId);
    }
  }

  private areButtonsDisabled() {
    return this.disabled;
  }
}
