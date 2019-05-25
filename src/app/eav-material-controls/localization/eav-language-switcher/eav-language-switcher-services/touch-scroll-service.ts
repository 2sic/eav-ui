import { Renderer2, ElementRef } from '@angular/core';

export class TouchScrollService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private oldOverflowX: string;
  private listeners: (() => void)[] = [];

  constructor(renderer: Renderer2, headerRef: ElementRef) {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
  }

  headerTouchStart(event: MouseEvent) {
    this.registerMobileScroll();
  }

  destroy() {
    this.listeners.forEach(listener => listener());
  }

  private registerMobileScroll() {
    const headerStyles = getComputedStyle(this.header);
    this.oldOverflowX = headerStyles['overflow-x'];
    this.renderer.setStyle(this.header, 'overflow-x', 'scroll');

    this.listeners.push(this.renderer.listen(this.header, 'touchend', this.removeMobileScroll.bind(this)));
    this.listeners.push(this.renderer.listen(this.header, 'touchcancel', this.removeMobileScroll.bind(this)));
  }

  private removeMobileScroll() {
    this.renderer.setStyle(this.header, 'overflow-x', this.oldOverflowX);
    this.listeners.forEach(listener => listener());
  }
}
