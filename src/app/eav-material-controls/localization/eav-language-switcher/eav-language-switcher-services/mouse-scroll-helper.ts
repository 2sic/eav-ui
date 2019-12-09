import { NgZone } from '@angular/core';
import { ElementEventListener } from '../../../../../../projects/shared/element-event-listener-model';

export class MouseScrollHelper {
  private oldScrollBehavior: string;
  private positionX: number;
  private headerDownListener: ElementEventListener;
  private eventListeners: ElementEventListener[] = [];

  constructor(
    private ngZone: NgZone,
    private header: HTMLElement,
    private areButtonsDisabled: () => boolean
  ) {
    this.ngZone.runOutsideAngular(() => {
      const registerScroll = this.registerScroll.bind(this);
      this.header.addEventListener('pointerdown', registerScroll, { passive: true });
      this.headerDownListener = { element: this.header, type: 'pointerdown', listener: registerScroll };
    });
  }

  destroy() {
    this.ngZone.runOutsideAngular(() => {
      this.headerDownListener.element.removeEventListener(this.headerDownListener.type, this.headerDownListener.listener);
      this.headerDownListener = null;
      this.eventListeners.forEach(evList => {
        evList.element.removeEventListener(evList.type, evList.listener);
        evList = null;
      });
      this.eventListeners = null;
    });
    this.ngZone = null;
    this.header = null;
    this.areButtonsDisabled = null;
  }

  private registerScroll(event: MouseEvent) {
    const disabled = this.areButtonsDisabled();
    if (disabled || event.button !== 0) { return; }

    window.getSelection().removeAllRanges();
    this.oldScrollBehavior = getComputedStyle(this.header)['scroll-behavior'];

    this.header.style.scrollBehavior = 'auto';
    this.positionX = event.pageX;

    const doScroll = this.doScroll.bind(this);
    const removeScroll = this.removeScroll.bind(this);
    document.addEventListener('pointermove', doScroll, { passive: true });
    document.addEventListener('pointerup', removeScroll, { passive: true });
    document.addEventListener('pointerleave', removeScroll, { passive: true });
    this.eventListeners.push(
      { element: document, type: 'pointermove', listener: doScroll },
      { element: document, type: 'pointerup', listener: removeScroll },
      { element: document, type: 'pointerleave', listener: removeScroll },
    );
  }

  private removeScroll() {
    this.header.style.scrollBehavior = this.oldScrollBehavior;

    this.eventListeners.forEach(evList => {
      evList.element.removeEventListener(evList.type, evList.listener);
      evList = null;
    });
    this.eventListeners.splice(0, this.eventListeners.length);
  }

  private doScroll(event: MouseEvent) {
    const newPositionX = event.pageX;
    if (newPositionX < this.positionX) {
      this.header.scrollLeft += this.positionX - newPositionX;
    } else if (newPositionX > this.positionX) {
      this.header.scrollLeft += -(newPositionX - this.positionX);
    }
    this.positionX = newPositionX;
  }
}
