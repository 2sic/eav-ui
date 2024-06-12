import { Directive, HostListener } from '@angular/core';

const logThis = true;

@Directive({
  selector: '[appClickStopPropagation]',
  standalone: true,
  host: {
    "(click)": "_click($event)"
  }
})
export class ClickStopPropagationDirective {
  constructor() {
    if (logThis) {
      console.log('ClickStopPropagationDirective.constructor');
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (logThis) {
      console.log('ClickStopPropagationDirective.onClick', event);
    }
    event.stopPropagation();
  }

  _click(event: MouseEvent): void {
    if (logThis) {
      console.log('ClickStopPropagationDirective._click', event);
    }
    event.stopPropagation();
  }
}
