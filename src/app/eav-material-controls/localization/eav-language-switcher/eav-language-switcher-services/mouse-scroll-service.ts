import { Renderer2, ElementRef } from '@angular/core';

export class MouseScrollService {
  private renderer: Renderer2;
  private header: HTMLElement;
  private oldScrollBehavior: string;
  private positionX: number;
  private listeners: (() => void)[] = [];
  private areButtonsDisabled: () => boolean;

  constructor(renderer: Renderer2, headerRef: ElementRef, areButtonsDisabled: () => boolean) {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
    this.areButtonsDisabled = areButtonsDisabled;
  }

  headerMouseDown(event: MouseEvent) {
    this.registerScroll(event);
  }

  destroy() {
    this.listeners.forEach(listener => listener());
  }

  private registerScroll(event: MouseEvent) {
    const disabled = this.areButtonsDisabled();
    if (disabled || event.button !== 0) { return; }

    const selection = window.getSelection();
    selection.removeAllRanges();
    const headerStyles = getComputedStyle(this.header);
    this.oldScrollBehavior = headerStyles['scroll-behavior'];

    this.renderer.setStyle(this.header, 'scroll-behavior', 'auto');
    this.positionX = event.pageX;

    this.listeners.push(this.renderer.listen('document', 'mousemove', this.doScroll.bind(this)));
    this.listeners.push(this.renderer.listen('document', 'mouseup', this.removeScroll.bind(this)));
    this.listeners.push(this.renderer.listen('document', 'mouseleave', this.removeScroll.bind(this)));
  }

  private removeScroll() {
    this.renderer.setStyle(this.header, 'scroll-behavior', this.oldScrollBehavior);

    this.listeners.forEach(listener => listener());
    this.listeners.splice(0, this.listeners.length);
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
