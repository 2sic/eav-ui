import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import tippy, { Instance, Placement, Props } from 'tippy.js';

// tslint:disable-next-line:directive-selector
@Directive({
    selector: '[tippy]',
    standalone: true
})
export class TippyStandaloneDirective implements OnChanges, OnDestroy {
  /** Message to show in Tippy */
  @Input() tippy: string | null | undefined;

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

  private tooltip: Instance<Props>;

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Init Tooltip on first round
    if (this.tooltip == null)
      this.tooltip = tippy(this.elementRef.nativeElement, {
        animation: 'scale-subtle',
        arrow: !!this.tippyArrow,
        duration: [100, 50],
        placement: 'bottom',
        theme: '2sxc',
        allowHTML: !!this.tippyAllowHtml,
      });

    if (changes['tippy'] != null)
      this.tooltip.setContent(this.tippy);

    if (changes['tippyDisabled'] != null)
      this.tippyDisabled ? this.tooltip.disable() : this.tooltip.enable();

    if (changes['tippyPlacement'] != null)
      this.tooltip.setProps({ placement: this.tippyPlacement as Placement });

    if (changes['tippyShowDelay'] != null) {
      const showDelay = typeof this.tippyShowDelay === 'number' ? this.tippyShowDelay : parseInt(this.tippyShowDelay, 10);
      this.tooltip.setProps({ delay: [showDelay, null] });
    }
  }

  ngOnDestroy(): void {
    this.tooltip?.destroy();
  }
}
