import { Directive, HostListener } from '@angular/core';

@Directive({ selector: '[appMousedownStopPropagation]' })
export class MousedownStopPropagationDirective {
  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent): void {
    event.stopPropagation();
  }
}
