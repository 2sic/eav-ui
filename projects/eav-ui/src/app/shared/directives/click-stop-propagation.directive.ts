import { Directive, HostListener } from '@angular/core';
import { classLog } from '../logging';

@Directive({
  selector: '[appClickStopPropagation]',
  standalone: true,
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
    event.preventDefault();
  }

}
