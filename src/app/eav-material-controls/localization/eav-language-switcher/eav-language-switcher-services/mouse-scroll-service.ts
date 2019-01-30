import { Injectable, Renderer2, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MouseScrollService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private oldScrollBehavior: string;
  private positionX: number;
  private documentMousemove: Function;
  private documentMouseup: Function;
  private documentMouseleave: Function;

  constructor() { }

  initMouseScroll(renderer: Renderer2, headerRef: ElementRef): void {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;

    this.renderer.listen(this.header, 'mousedown', this.registerScroll.bind(this));
  }

  private registerScroll(event: any): void {
    const headerStyles = getComputedStyle(this.header);
    this.oldScrollBehavior = headerStyles['scroll-behavior'];

    this.renderer.setStyle(this.header, 'scroll-behavior', 'auto');
    this.positionX = event.pageX;

    this.documentMousemove = this.renderer.listen('document', 'mousemove', this.doScroll.bind(this));
    this.documentMouseup = this.renderer.listen('document', 'mouseup', this.removeScroll.bind(this));
    this.documentMouseleave = this.renderer.listen('document', 'mouseleave', this.removeScroll.bind(this));
  }

  private removeScroll(): void {
    this.renderer.setStyle(this.header, 'scroll-behavior', this.oldScrollBehavior);

    this.documentMousemove();
    this.documentMouseup();
    this.documentMouseleave();
  }

  private doScroll(event: any): void {
    const newPositionX = event.pageX;
    if (newPositionX < this.positionX) {
      this.header.scrollLeft += this.positionX - newPositionX;
    } else if (newPositionX > this.positionX) {
      this.header.scrollLeft += -(newPositionX - this.positionX);
    }
    this.positionX = newPositionX;
  }
}
