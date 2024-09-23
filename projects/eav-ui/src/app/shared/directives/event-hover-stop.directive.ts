import { Directive, HostListener } from '@angular/core';
import { classLog } from '../logging';

/** NOTE: this was an experiment, but is not is use. It may not work! */
@Directive({
  selector: '[appEventHoverStop]',
  standalone: true,
})
export class EventHoverStopDirective {

  log = classLog({EventHoverStopDirective}, null, true);

  // Log constructor to detect that it was really attached/created
  constructor() {
    this.log.a('constructor');
  }

  @HostListener('mouseover', ['$event'])
  onMouseover(event: MouseEvent): void {
    this.log.a('onMouseover', { event });
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('mouseout', ['$event'])
  onMouseout(event: MouseEvent): void {
    this.log.a('onMouseout', { event });
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('mouseenter', ['$event'])
  onMouseenter(event: MouseEvent): void {
    this.log.a('onMouseenter', { event });
    event.stopPropagation();
    event.preventDefault();
  }

}
