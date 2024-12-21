import { Directive, ElementRef, input, OnChanges, OnDestroy, Optional, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import tippy, { Instance, Placement, Props } from 'tippy.js';

// const eventTippyShow = 'tippy-show';

@Directive({
  selector: '[tippy], [tippyTranslate]',
})
export class TippyDirective implements OnChanges, OnDestroy {
  /** Message to show in Tippy - raw */
  tippy = input<string | null | undefined>();

  /** Message to show in Tippy - auto translated */
  tippyTranslate = input<string | null | undefined>();

  /** disable Tippy */
  tippyDisabled = input<string | boolean | null | undefined>();

  /** Data to use with the tippy-message. For mixing in with the tippyTranslate */
  tippyData = input<Record<string, unknown> | null>();

  /**
   * 'top' | 'top-start' | 'top-end' |
   * 'right' | 'right-start' | 'right-end' |
   * 'bottom' | 'bottom-start' | 'bottom-end' |
   * 'left' | 'left-start' | 'left-end' |
   * 'auto' | 'auto-start' | 'auto-end'
   */
  tippyPlacement = input<string | null | undefined>();

  /** delay showing Tippy in ms */
  tippyShowDelay = input<string | null | undefined>();

  /** enable html in Tippy */
  tippyAllowHtml = input<boolean | null | undefined>();

  /** show arrow in Tippy - only respected on setup, changes ATM not handled */
  tippyArrow = input<boolean | null | undefined>();

  tippyFontSize = input<string | null | undefined>();

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
        arrow: !!this.tippyArrow(),
        duration: [100, 50],
        placement: 'bottom',
        theme: '2sxc',
        allowHTML: !!this.tippyAllowHtml(),
        // Experimental, try to prevent multiple Tippys from showing. Not working ATM.
        // onShow: (instance) => {
        //   const msg = new CustomEvent(eventTippyShow, { detail: { instance } });
        //   this.elementRef.nativeElement.parentElement.dispatchEvent(msg);
        // },
      });

    if (changes['tippy'] != null || changes['tippyTranslate'] != null || changes['tippyFontSize'] != null) {
      const val = this.tippyTranslate()?.toString() ?? '';
      const contents = val
        ? this.translate?.instant(val, this.tippyData()) ?? val // temp with null-check in case the service is missing ATM
        : this.tippy()?.toString() ?? '';

      // Disable Tippy if no content, but re-enable if content is added later
      contents ? this.#tooltip.enable() : this.#tooltip.disable();

      const body = !this.tippyAllowHtml()
        ? contents
        : this.tippyFontSize() === 'larger'
          ? `<div style="font-size: larger">${contents}</div>`
          : contents;

      this.#tooltip.setContent(body);
    }

    if (changes['tippyDisabled'] != null)
      this.tippyDisabled() ? this.#tooltip.disable() : this.#tooltip.enable();

    if (changes['tippyPlacement'] != null)
      this.#tooltip.setProps({ placement: this.tippyPlacement() as Placement });

    if (changes['tippyShowDelay'] != null) {
      const showDelay = parseInt(this.tippyShowDelay(), 10);
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
