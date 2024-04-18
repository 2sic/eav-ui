import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { delay, filter, fromEvent, map, merge, pairwise, Subscription } from 'rxjs';
import { BaseSubsinkComponent } from '../../../shared/components/base-subsink-component/base-subsink.component';
import { EavService } from '../../shared/services';
import { LanguageInstanceService, LanguageService } from '../../shared/store/ngrx-data';

@Directive({
    selector: '[appFormSlide]',
    standalone: true
})
export class FormSlideDirective extends BaseSubsinkComponent implements OnInit, OnDestroy {

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private languageInstanceService: LanguageInstanceService,
    private languageService: LanguageService,
    private eavService: EavService,
  ) {
    super();
   }

  ngOnInit() {
    this.subscription.add(
      merge(
        this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId).pipe(
          pairwise(),
          map(([previousLang, currentLang]) => {
            const languages = this.languageService.getLanguages();
            const previousLangIndex = languages.findIndex(lang => lang.NameId === previousLang);
            const currentLangIndex = languages.findIndex(lang => lang.NameId === currentLang);
            const slide = (previousLangIndex > currentLangIndex) ? 'previous' : 'next';
            return slide;
          }),
        ),
        fromEvent<AnimationEvent>(this.elementRef.nativeElement, 'animationend').pipe(
          filter(event => event.animationName === 'move-next' || event.animationName === 'move-previous'),
          map(() => ''),
          delay(0), // small delay because animationend fires a bit too early
        ),
      ).subscribe(slide => {
        if (slide === '') {
          this.elementRef.nativeElement.classList.remove('previous');
          this.elementRef.nativeElement.classList.remove('next');
        } else {
          this.elementRef.nativeElement.classList.add(slide);
        }
      })
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
