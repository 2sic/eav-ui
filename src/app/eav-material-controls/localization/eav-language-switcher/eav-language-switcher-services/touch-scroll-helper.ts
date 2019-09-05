import { NgZone } from '@angular/core';
import { ElementEventListener } from '../../../../../../projects/shared/element-event-listener-model';

export class TouchScrollHelper {
  private oldOverflowX: string;
  private headerStartListener: ElementEventListener;
  private eventListeners: ElementEventListener[] = [];

  constructor(
    private ngZone: NgZone,
    private header: HTMLElement,
    private areButtonsDisabled: () => boolean
  ) { }

  init() {
    this.ngZone.runOutsideAngular(() => {
      const setOverflowScroll = this.setOverflowScroll.bind(this);
      this.header.addEventListener('touchstart', setOverflowScroll, { passive: true });
      this.headerStartListener = { element: this.header, type: 'touchstart', listener: setOverflowScroll };
    });
  }

  destroy() {
    this.ngZone.runOutsideAngular(() => {
      this.headerStartListener.element.removeEventListener(this.headerStartListener.type, this.headerStartListener.listener);
      this.headerStartListener = null;
      this.eventListeners.forEach(evList => {
        evList.element.removeEventListener(evList.type, evList.listener);
        evList = null;
      });
      this.eventListeners = null;
    });
  }

  private setOverflowScroll() {
    const disabled = this.areButtonsDisabled();
    if (disabled) { return; }

    this.oldOverflowX = getComputedStyle(this.header)['overflow-x'];
    this.header.style.overflowX = 'scroll';

    const unsetOverflowScroll = this.unsetOverflowScroll.bind(this);
    this.header.addEventListener('touchend', unsetOverflowScroll, { passive: true });
    this.header.addEventListener('touchcancel', unsetOverflowScroll, { passive: true });
    this.eventListeners.push(
      { element: this.header, type: 'touchend', listener: unsetOverflowScroll },
      { element: this.header, type: 'touchcancel', listener: unsetOverflowScroll },
    );
  }

  private unsetOverflowScroll() {
    this.header.style.overflowX = this.oldOverflowX;

    this.eventListeners.forEach(evList => {
      evList.element.removeEventListener(evList.type, evList.listener);
      evList = null;
    });
    this.eventListeners.splice(0, this.eventListeners.length);
  }
}
