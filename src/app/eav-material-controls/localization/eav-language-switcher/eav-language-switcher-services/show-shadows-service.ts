import { Renderer2, ElementRef } from '@angular/core';

export class ShowShadowsService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private leftShadow: HTMLElement;
  private rightShadow: HTMLElement;
  private maxScrollLeft: number;
  private hidden = 'hidden'; // CSS class which hides shadows
  private listeners: (() => void)[] = [];

  constructor() { }

  initShadowsCalculation(renderer: Renderer2, headerRef: ElementRef, leftShadowRef: ElementRef, rightShadowRef: ElementRef) {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
    this.leftShadow = leftShadowRef.nativeElement;
    this.rightShadow = rightShadowRef.nativeElement;

    this.calculateShadows();
    this.listeners.push(this.renderer.listen('window', 'resize', this.calculateShadows.bind(this)));
  }

  scrollableScroll(event: MouseEvent) {
    this.calculateShadows();
  }

  destroy() {
    this.listeners.forEach(listener => listener());
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
    this.renderer.addClass(this.leftShadow, this.hidden);
    this.renderer.addClass(this.rightShadow, this.hidden);
  }

  private hideLeft() {
    this.renderer.addClass(this.leftShadow, this.hidden);
    this.renderer.removeClass(this.rightShadow, this.hidden);
  }

  private hideRight() {
    this.renderer.removeClass(this.leftShadow, this.hidden);
    this.renderer.addClass(this.rightShadow, this.hidden);
  }

  private showBoth() {
    this.renderer.removeClass(this.leftShadow, this.hidden);
    this.renderer.removeClass(this.rightShadow, this.hidden);
  }
}
