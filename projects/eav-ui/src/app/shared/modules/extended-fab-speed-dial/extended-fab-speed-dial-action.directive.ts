import { Directive, ElementRef, input, OnChanges, SimpleChanges } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({
  selector: '[extended-fab-speed-dial-action]',
})
export class ExtendedFabSpeedDialActionDirective implements OnChanges {
  disabled = input<boolean>(false);

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled != null) {
      this.elementRef.nativeElement.toggleAttribute('disabled', this.disabled());
    }
  }
}
