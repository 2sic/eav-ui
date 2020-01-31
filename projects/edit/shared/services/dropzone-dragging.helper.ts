import { NgZone } from '@angular/core';
import { ElementEventListener } from '../../../../../shared/element-event-listener-model';
declare const draggingClass: string;
declare const windowBodyTimeouts: number[];

export class DropzoneDraggingHelper {
  private eventListeners: ElementEventListener[] = [];

  constructor(private zone: NgZone) { }

  /** Starts listening for dragover and drop events on a given element */
  attach(htmlEl: HTMLElement) {
    this.zone.runOutsideAngular(() => {
      htmlEl.addEventListener('dragover', dragoverListener);
      htmlEl.addEventListener('drop', dropListener);

      this.eventListeners.push(
        { element: htmlEl, type: 'dragover', listener: dragoverListener },
        { element: htmlEl, type: 'drop', listener: dropListener },
      );

      function dragoverListener() {
        clearTimeouts(windowBodyTimeouts); // clear timeouts from global array of timeouts which clear draggingClass from body
        document.body.classList.add(draggingClass);
      }
      function dropListener() {
        document.body.classList.remove(draggingClass);
      }
      function clearTimeouts(timeoutsArray: number[]) {
        for (let i = 0; i < timeoutsArray.length; i++) {
          clearTimeout(timeoutsArray[i]);
        }
        timeoutsArray.splice(0, timeoutsArray.length);
      }
    });
  }

  /** Removes event listeners from registered elements */
  detach() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(eventListener => {
        const element = eventListener.element;
        const type = eventListener.type;
        const listener = eventListener.listener;
        element.removeEventListener(type, listener);
      });
    });
  }
}
