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
  ) { }

  init() {
    this.ngZone.runOutsideAngular(() => {
      const registerScroll = this.registerScroll.bind(this);
      this.header.addEventListener('mousedown', registerScroll, { passive: true });
      this.headerDownListener = { element: this.header, type: 'mousedown', listener: registerScroll };
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
    document.addEventListener('mousemove', doScroll, { passive: true });
    document.addEventListener('mouseup', removeScroll, { passive: true });
    document.addEventListener('mouseleave', removeScroll, { passive: true });
    this.eventListeners.push(
      { element: document, type: 'mousemove', listener: doScroll },
      { element: document, type: 'mouseup', listener: removeScroll },
      { element: document, type: 'mouseleave', listener: removeScroll },
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
