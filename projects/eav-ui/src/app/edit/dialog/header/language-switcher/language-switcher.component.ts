import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../shared/logging';
import { FormConfigService } from '../../../form/form-config.service';
import { FormLanguageService } from '../../../form/form-language.service';
import { Language } from '../../../form/form-languages.model';
import { LanguageService } from '../../../localization/language.service';
import { CenterSelectedHelper } from './center-selected.helper';
import { getLanguageOptions } from './language-switcher.helpers';
import { MouseScrollHelper } from './mouse-scroll.helper';
import { ShowShadowsHelper } from './show-shadows.helper';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    TippyDirective,
  ],
})
export class LanguageSwitcherComponent implements AfterViewInit, OnDestroy {

  log = classLog({LanguageSwitcherComponent});

  @ViewChild('scrollable') private headerRef: ElementRef;
  @ViewChild('leftShadow') private leftShadowRef: ElementRef;
  @ViewChild('rightShadow') private rightShadowRef: ElementRef;
  disabled = input<boolean>();

  private centerSelectedHelper: CenterSelectedHelper;
  private mouseScrollHelper: MouseScrollHelper;
  private showShadowsHelper: ShowShadowsHelper;

  current = computed(() => this.formConfig.language().current);

  buttons = getLanguageOptions(this.languageService.getAll());

  constructor(
    private languageService: LanguageService,
    private languageInstanceService: FormLanguageService,
    private ngZone: NgZone,
    private formConfig: FormConfigService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) { }

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
    this.centerSelectedHelper?.destroy();
    this.mouseScrollHelper?.destroy();
    this.showShadowsHelper?.destroy();
  }

  lngButtonMouseDown(event: MouseEvent) {
    this.centerSelectedHelper.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    const l = this.log.fn('lngButtonClick');
    if (this.disabled()) {
      this.snackBar.open(this.translate.instant('Message.CantSwitchLanguage'), null, { duration: 3000, verticalPosition: 'top' });
      return l.end('disabled');
    }
    this.centerSelectedHelper.lngButtonClick(event);

    if (!this.centerSelectedHelper.stopClickIfMouseMoved()) {
      this.languageInstanceService.setCurrent(this.formConfig.config.formId, language.NameId);
    }
  }

  private areButtonsDisabled() {
    return this.disabled();
  }
}
