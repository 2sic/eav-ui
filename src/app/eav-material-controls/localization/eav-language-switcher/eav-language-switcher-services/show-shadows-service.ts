import { Injectable, Renderer2, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShowShadowsService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private leftShadow: HTMLElement;
  private rightShadow: HTMLElement;
  private maxScrollLeft: number;
  private hidden = 'hidden'; // CSS class which hides shadows

  constructor() { }

  initShadowsCalculation(renderer: Renderer2, headerRef: ElementRef, leftShadowRef: ElementRef, rightShadowRef: ElementRef): void {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
    this.leftShadow = leftShadowRef.nativeElement;
    this.rightShadow = rightShadowRef.nativeElement;

    this.calculateShadows();
    this.renderer.listen('window', 'resize', this.calculateShadows.bind(this));
    this.renderer.listen(this.header, 'scroll', this.calculateShadows.bind(this));
  }

  private calculateShadows(): void {
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

  private hideBoth(): void {
    this.renderer.addClass(this.leftShadow, this.hidden);
    this.renderer.addClass(this.rightShadow, this.hidden);
  }

  private hideLeft(): void {
    this.renderer.addClass(this.leftShadow, this.hidden);
    this.renderer.removeClass(this.rightShadow, this.hidden);
  }

  private hideRight(): void {
    this.renderer.removeClass(this.leftShadow, this.hidden);
    this.renderer.addClass(this.rightShadow, this.hidden);
  }

  private showBoth(): void {
    this.renderer.removeClass(this.leftShadow, this.hidden);
    this.renderer.removeClass(this.rightShadow, this.hidden);
  }
}
