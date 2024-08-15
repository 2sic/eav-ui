import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { delay, distinctUntilChanged, filter, fromEvent, map, merge, pairwise, tap } from 'rxjs';
import { FormConfigService } from '../../shared/services';
import { LanguageInstanceService, LanguageService } from '../../shared/store/ngrx-data';
import { BaseDirective } from '../../../shared/directives/base.directive';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';

const logThis = false;
const nameOfThis = 'FormSlideDirective';

const classNext = 'next';
const classPrevious = 'previous';
const animationNames = ['move-next', 'move-previous'];

@Directive({
  selector: '[appFormSlide]',
  standalone: true
})
export class FormSlideDirective extends BaseDirective implements OnInit, OnDestroy {

  log = new EavLogger(nameOfThis, logThis);

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private languageService: LanguageService,
    private formConfig: FormConfigService,
  ) {
    super();
  }

  ngOnInit() {
    const l = this.log.fn('ngOnInit');
    const languages = this.languageService.getLanguages();
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
