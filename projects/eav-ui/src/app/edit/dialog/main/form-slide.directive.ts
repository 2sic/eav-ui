import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { delay, filter, fromEvent, map, merge, pairwise } from 'rxjs';
import { classLog } from '../../../../../../shared/logging';
import { BaseDirective } from '../../../shared/directives/base.directive';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FormConfigService } from '../../form/form-config.service';
import { LanguageService } from '../../localization/language.service';

const classNext = 'next';
const classPrevious = 'previous';
const animationNames = ['move-next', 'move-previous'];

@Directive({
  selector: '[appFormSlide]',
})
export class FormSlideDirective extends BaseDirective implements OnInit, OnDestroy {

  log = classLog({FormSlideDirective});

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private languageService: LanguageService,
    private formConfig: FormConfigService,
  ) {
    super();
  }

  ngOnInit() {
    const l = this.log.fn('ngOnInit');
    const languages = this.languageService.getAll();
    const nativeElement = this.elementRef.nativeElement;
    this.subscriptions.add(
      merge(
        // emit 'next' and 'previous' slide direction based on language change
        this.formConfig.language$.pipe(
          map(language => language.current),
          mapUntilChanged(m => m),
          // distinctUntilChanged(),
          pairwise(),
          map(([previousLang, currentLang]) => {
            l.a('toggle', { previousLang, currentLang });
            const prevIndex = languages.findIndex(lang => lang.NameId === previousLang);
            const currentIndex = languages.findIndex(lang => lang.NameId === currentLang);
            const slide = (prevIndex > currentIndex) ? classPrevious : classNext;
            l.a('slide', { prevIndex, currentIndex, slide });
            return slide;
          }),
        ),
        // emit '' to stop the slide animation
        fromEvent<AnimationEvent>(nativeElement, 'animationend').pipe(
          filter(event => animationNames.find(an => event.animationName.endsWith(an)) !== undefined),
          map(() => ''),
          delay(0), // small delay because animationend fires a bit too early
        ),
      ).subscribe(slide => {
        const classList = nativeElement.classList;
        if (slide === '') {
          l.a('stop-slide');
          classList.remove(classNext);
          classList.remove(classPrevious);
        } else {
          l.a(`start-slide to '${slide}'`);
          classList.add(slide);
        }
      })
    );
  }
}
