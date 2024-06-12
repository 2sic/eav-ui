import { Directive, HostListener } from '@angular/core';

const logThis = false;

@Directive({
  selector: '[appClickStopPropagation]',
  standalone: true,
})
export class ClickStopPropagationDirective {
  constructor() {
    if (logThis)
      console.log('ClickStopPropagationDirective.constructor');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (logThis)
      console.log('ClickStopPropagationDirective.onClick', event);
    event.stopPropagation();
  }

}
