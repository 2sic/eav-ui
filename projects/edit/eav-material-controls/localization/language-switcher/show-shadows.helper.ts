import { NgZone } from '@angular/core';
import { ElementEventListener } from '../../../../shared/element-event-listener.model';

export class ShowShadowsHelper {
  private maxScrollLeft: number;
  private hidden = 'hidden'; // CSS class which hides shadows
  private eventListeners: ElementEventListener[] = [];

  constructor(
    private ngZone: NgZone,
    private header: HTMLElement,
    private leftShadow: HTMLElement,
    private rightShadow: HTMLElement,
  ) {
    this.ngZone.runOutsideAngular(() => {
      this.calculateShadows();

      const calculateShadows = this.calculateShadows.bind(this);
      this.header.addEventListener('scroll', calculateShadows, { passive: true });
      window.addEventListener('resize', calculateShadows, { passive: true });
      this.eventListeners.push(
        { element: this.header, type: 'scroll', listener: calculateShadows },
        { element: window, type: 'resize', listener: calculateShadows },
      );
    });
  }

  destroy() {
    this.ngZone.runOutsideAngular(() => {
      this.eventListeners.forEach(evList => {
        evList.element.removeEventListener(evList.type, evList.listener);
        evList = null;
      });
      this.eventListeners = null;
    });
    this.ngZone = null;
    this.header = null;
    this.leftShadow = null;
    this.rightShadow = null;
  }

  private calculateShadows() {
    this.maxScrollLeft = this.header.scrollWidth - this.header.clientWidth;

    if (this.maxScrollLeft === 0) {
      this.hideBoth();
    } else if (this.header.scrollLeft === 0) {
      this.hideLeft();
    } else if (this.header.scrollLeft === this.maxScrollLeft) {
      this.hideRight();
    } else {
      this.showBoth();
    }
  }

  private hideBoth() {
    this.leftShadow.classList.add(this.hidden);
    this.rightShadow.classList.add(this.hidden);
  }

  private hideLeft() {
    this.leftShadow.classList.add(this.hidden);
    this.rightShadow.classList.remove(this.hidden);
  }

  private hideRight() {
    this.leftShadow.classList.remove(this.hidden);
    this.rightShadow.classList.add(this.hidden);
  }

  private showBoth() {
    this.leftShadow.classList.remove(this.hidden);
    this.rightShadow.classList.remove(this.hidden);
  }
}
