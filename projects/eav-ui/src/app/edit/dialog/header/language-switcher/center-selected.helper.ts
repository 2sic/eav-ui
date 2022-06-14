import { NgZone } from '@angular/core';
import { ElementEventListener } from '../../../shared/models';

export class CenterSelectedHelper {
  private positionX: number;
  private positionY: number;
  private moveThreshold = 2; // pixels for which header can be scrolled while clicking to still register as click
  private stopClick = false;
  private eventListeners: ElementEventListener[] = [];

  constructor(
    private ngZone: NgZone,
    private header: HTMLElement,
  ) {
    this.ngZone.runOutsideAngular(() => {
      const checkIfMouseMoved = (event: MouseEvent) => { this.checkIfMouseMoved(event); };
      document.addEventListener('mouseup', checkIfMouseMoved, { passive: true });
      this.eventListeners.push({ element: document, type: 'mouseup', listener: checkIfMouseMoved });
    });
  }

  lngButtonDown(event: MouseEvent) {
    this.ngZone.runOutsideAngular(() => {
      this.saveInitialPosition(event);
    });
  }

  lngButtonClick(event: MouseEvent) {
    this.ngZone.runOutsideAngular(() => {
      this.doMove(event);
    });
  }

  stopClickIfMouseMoved() {
    return this.stopClick;
  }

  destroy() {
    this.ngZone.runOutsideAngular(() => {
      this.eventListeners.forEach(({ element, type, listener }) => {
        element.removeEventListener(type, listener);
      });
      this.eventListeners = null;
    });
  }

  private saveInitialPosition(event: MouseEvent) {
    this.stopClick = false;
    this.positionX = event.pageX;
    this.positionY = event.pageY;
  }

  private checkIfMouseMoved(event: MouseEvent) {
    if (!this.positionX || !this.positionY) {
      this.stopClick = false;
      return;
    }
    const newPositionX = event.pageX;
    const newPositionY = event.pageY;

    const newTotal = newPositionX + newPositionY;
    const oldTotal = this.positionX + this.positionY;

    this.stopClick = Math.abs(oldTotal - newTotal) > this.moveThreshold;
    this.positionX = null;
    this.positionY = null;
  }

  private doMove(event: MouseEvent) {
    if (this.stopClick) { return; }

    const button = event.target as HTMLButtonElement;
    const buttonOffset = button.getBoundingClientRect().left;
    const buttonWidth = button.getBoundingClientRect().width;
    const headerOffset = this.header.getBoundingClientRect().left;
    const headerWidth = this.header.getBoundingClientRect().width;

    const currentPosition = buttonOffset + buttonWidth / 2;
    const moveTo = headerOffset + headerWidth / 2;

    this.header.scrollLeft += currentPosition - moveTo;
  }
}
