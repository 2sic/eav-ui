import { Directive, HostListener } from '@angular/core';

@Directive({ selector: '[appMousedownStopPropagation]' })
export class MousedownStopPropagationDirective {
  @HostListener('mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopImmediatePropagation();
  }
}
