import { Injectable, NgZone, ElementRef } from '@angular/core';
import { ElementEventListener } from '../../../../projects/shared/element-event-listener-model';
declare const draggingClass: any;
declare const windowBodyTimeouts: any;

@Injectable({
  providedIn: 'root'
})
export class DropzoneDraggingService {
  private eventListeners: ElementEventListener[] = [];

  constructor(private zone: NgZone) { }

  /**
   * starts listening for dragover and drop events on a given element
   */
  attach(elementRef: ElementRef) {
    const nativeElement = elementRef.nativeElement as HTMLElement;
    this.zone.runOutsideAngular(() => {
      nativeElement.addEventListener('dragover', dragoverListener);
      nativeElement.addEventListener('drop', dropListener);

      this.eventListeners.push(
        { element: nativeElement, type: 'dragover', listener: dragoverListener },
        { element: nativeElement, type: 'drop', listener: dropListener },
      );

      function dragoverListener() {
        clearTimeouts(windowBodyTimeouts); // clear timeouts from global array of timeouts which clear draggingClass from body
        document.body.classList.add(draggingClass);
      }
      function dropListener() {
        document.body.classList.remove(draggingClass);
      }
      function clearTimeouts(timeoutsArray) {
        for (let i = 0; i < timeoutsArray.length; i++) {
          clearTimeout(timeoutsArray[i]);
        }
        timeoutsArray.splice(0, timeoutsArray.length);
      }
    });
  }

  /**
   * removes event listeners from registered elements
   */
  detach() {
    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
  }
}
