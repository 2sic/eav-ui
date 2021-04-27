import { NgZone } from '@angular/core';
import { EavWindow } from '../../../ng-dialogs/src/app/shared/models/eav-window.model';
import { ElementEventListener } from '../models';

declare const window: EavWindow;

export class DropzoneDraggingHelper {
  private eventListeners: ElementEventListener[] = [];

  constructor(private zone: NgZone) { }

  /** Starts listening for dragover and drop events on a given element */
  attach(htmlEl: HTMLElement) {
    this.zone.runOutsideAngular(() => {
      htmlEl.addEventListener('dragover', dragoverListener, { passive: true });
      htmlEl.addEventListener('drop', dropListener, { passive: true });

      this.eventListeners.push(
        { element: htmlEl, type: 'dragover', listener: dragoverListener },
        { element: htmlEl, type: 'drop', listener: dropListener },
      );

      function dragoverListener() {
        clearTimeouts(window.windowBodyTimeouts); // clear timeouts from global array of timeouts which clear draggingClass from body
        document.body.classList.add(window.draggingClass);
      }
      function dropListener() {
        document.body.classList.remove(window.draggingClass);
      }
      function clearTimeouts(timeoutsArray: number[]) {
        for (const timeout of timeoutsArray) {
          clearTimeout(timeout);
        }
        timeoutsArray.splice(0, timeoutsArray.length);
      }
    });
  }

  /** Removes event listeners from registered elements */
  detach() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(({ element, type, listener }) => {
        element.removeEventListener(type, listener);
      });
    });
  }
}
