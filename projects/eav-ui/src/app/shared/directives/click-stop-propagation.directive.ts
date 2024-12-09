import { Directive, HostListener } from '@angular/core';
import { classLog } from '../logging';

@Directive({
  selector: '[appClickStopPropagation]',
})
export class ClickStopPropagationDirective {

  log = classLog({ClickStopPropagationDirective});

  // Log constructor to detect that it was really attached/created
  constructor() {
    this.log.a('constructor');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.log.a('onClick', { event });
    event.stopPropagation();

    // This should never be added here, as it's often on a link, and the default behavior (link open) should happen
    // event.preventDefault();
  }

}
