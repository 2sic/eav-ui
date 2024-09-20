import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appMousedownStopPropagation]',
  standalone: true
})
export class MousedownStopPropagationDirective {
  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent): void {
    event.stopPropagation();
  }
}
