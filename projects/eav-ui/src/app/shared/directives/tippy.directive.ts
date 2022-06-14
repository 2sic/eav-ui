import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import tippy, { Instance, Placement, Props } from 'tippy.js';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[tippy]' })
export class TippyDirective implements OnChanges, OnDestroy {
  @Input() tippy: string | null | undefined;
  @Input() tippyDisabled: string | boolean | null | undefined;
  /**
   * 'top' | 'top-start' | 'top-end' |
   * 'right' | 'right-start' | 'right-end' |
   * 'bottom' | 'bottom-start' | 'bottom-end' |
   * 'left' | 'left-start' | 'left-end' |
   * 'auto' | 'auto-start' | 'auto-end'
   */
  @Input() tippyPlacement: string | null | undefined;
  @Input() tippyShowDelay: string | number | null | undefined;

  private tooltip: Instance<Props>;

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tooltip == null) {
      this.tooltip = tippy(this.elementRef.nativeElement, {
        animation: 'scale-subtle',
        arrow: false,
        duration: [100, 50],
        placement: 'bottom',
        theme: '2sxc',
      });
    }

    if (changes['tippy'] != null) {
      this.tooltip.setContent(this.tippy);
    }

    if (changes['tippyDisabled'] != null) {
      if (this.tippyDisabled) {
        this.tooltip.disable();
      } else {
        this.tooltip.enable();
      }
    }

    if (changes['tippyPlacement'] != null) {
      this.tooltip.setProps({ placement: this.tippyPlacement as Placement });
    }

    if (changes['tippyShowDelay'] != null) {
      const showDelay = typeof this.tippyShowDelay === 'number' ? this.tippyShowDelay : parseInt(this.tippyShowDelay, 10);
      this.tooltip.setProps({ delay: [showDelay, null] });
    }
  }

  ngOnDestroy(): void {
    this.tooltip?.destroy();
  }
}
