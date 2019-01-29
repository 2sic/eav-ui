import { Injectable, Renderer2, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TouchScrollService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private oldOverflowX: string;
  private headerTouchend: Function;
  private headerTouchcancel: Function;

  constructor() { }

  initTouchScroll(renderer: Renderer2, headerRef: ElementRef): void {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;

    this.renderer.listen(this.header, 'touchstart', this.registerMobileScroll.bind(this));
  }

  private registerMobileScroll(): void {
    console.log('Petar registerMobileScroll');
    const headerStyles = getComputedStyle(this.header);
    this.oldOverflowX = headerStyles['overflow-x'];
    this.renderer.setStyle(this.header, 'overflow-x', 'scroll');

    this.headerTouchend = this.renderer.listen(this.header, 'touchend', this.removeMobileScroll.bind(this));
    this.headerTouchcancel = this.renderer.listen(this.header, 'touchcancel', this.removeMobileScroll.bind(this));
  }

  private removeMobileScroll(): void {
    console.log('Petar removeMobileScroll');
    this.renderer.setStyle(this.header, 'overflow-x', this.oldOverflowX);

    this.headerTouchend();
    this.headerTouchcancel();
  }
}
