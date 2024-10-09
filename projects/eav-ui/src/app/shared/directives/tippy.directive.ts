import { Directive, ElementRef, Input, OnChanges, OnDestroy, Optional, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import tippy, { Instance, Placement, Props } from 'tippy.js';

// const eventTippyShow = 'tippy-show';

@Directive({
  selector: '[tippy], [tippyTranslate]',
  standalone: true
})
export class TippyDirective implements OnChanges, OnDestroy {
  /** Message to show in Tippy - raw */
  @Input() tippy: string | null | undefined;

  /** Message to show in Tippy - auto translated */
  @Input() tippyTranslate: string | null | undefined;

  /** disable Tippy */
  @Input() tippyDisabled: string | boolean | null | undefined;

  /**
   * 'top' | 'top-start' | 'top-end' |
   * 'right' | 'right-start' | 'right-end' |
   * 'bottom' | 'bottom-start' | 'bottom-end' |
   * 'left' | 'left-start' | 'left-end' |
   * 'auto' | 'auto-start' | 'auto-end'
   */
  @Input() tippyPlacement: string | null | undefined;

  /** delay showing Tippy in ms */
  @Input() tippyShowDelay: string | number | null | undefined;

  /** enable html in Tippy */
  @Input() tippyAllowHtml: boolean | null | undefined;

  /** show arrow in Tippy - only respected on setup, changes ATM not handled */
  @Input() tippyArrow: boolean | null | undefined;

  @Input() tippyFontSize: null | 'larger';

  #tooltip: Instance<Props>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    /** New 18.02 */
    @Optional() private translate: TranslateService,  // ATM optional, as we're not 100% sure that it's always registered
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Init Tooltip on first round
    if (this.#tooltip == null)
      this.#tooltip = tippy(this.elementRef.nativeElement, {
        animation: 'scale-subtle',
        arrow: !!this.tippyArrow,
        duration: [100, 50],
        placement: 'bottom',
        theme: '2sxc',
        allowHTML: !!this.tippyAllowHtml,
        // Experimental, try to prevent multiple Tippys from showing. Not working ATM.
        // onShow: (instance) => {
        //   const msg = new CustomEvent(eventTippyShow, { detail: { instance } });
        //   this.elementRef.nativeElement.parentElement.dispatchEvent(msg);
        // },
      });

    if (changes['tippy'] != null || changes['tippyTranslate'] != null || changes['tippyFontSize'] != null) {
      const contents = this.tippyTranslate
        ? this.translate?.instant(this.tippyTranslate) ?? this.tippyTranslate // temp with null-check in case the service is missing ATM
        : this.tippy ?? '';

      if (!contents)
        this.#tooltip.disable();

      const body = !this.tippyAllowHtml
        ? contents
        : this.tippyFontSize === 'larger'
          ? `<div style="font-size: larger">${contents}</div>`
          : contents;

      this.#tooltip.setContent(body);
    }

    if (changes['tippyDisabled'] != null)
      this.tippyDisabled ? this.#tooltip.disable() : this.#tooltip.enable();

    if (changes['tippyPlacement'] != null)
      this.#tooltip.setProps({ placement: this.tippyPlacement as Placement });

    if (changes['tippyShowDelay'] != null) {
      const showDelay = typeof this.tippyShowDelay === 'number' ? this.tippyShowDelay : parseInt(this.tippyShowDelay, 10);
      this.#tooltip.setProps({ delay: [showDelay, null] });
    }
  }

  // Experimental, try to prevent multiple Tippys from showing. Not working ATM.
  // @HostListener(eventTippyShow, ['$event'])
  // onTippyShow(event: CustomEvent): void {
  //   // console.warn('tippy-show event from', event);
  // }

  ngOnDestroy(): void {
    this.#tooltip?.destroy();
  }
}
