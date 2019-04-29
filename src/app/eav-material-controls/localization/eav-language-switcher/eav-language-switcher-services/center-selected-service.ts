import { Renderer2, ElementRef } from '@angular/core';

export class CenterSelectedService {
  private header: HTMLElement;
  private renderer: Renderer2;
  private positionX: number;
  private positionY: number;
  private moveThreshold = 2; // Pixels for which header can be scrolled while clicking to still register as click
  private stopClick = false;
  private listeners: (() => void)[] = [];

  constructor() { }

  initCenterSelected(renderer: Renderer2, headerRef: ElementRef) {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;

    this.listeners.push(this.renderer.listen('document', 'mouseup', this.checkIfMouseMoved.bind(this)));
  }

  lngButtonDown(event: MouseEvent) {
    this.saveInitialPosition(event);
  }

  lngButtonClick(event: MouseEvent) {
    this.doMove(event);
  }

  stopClickIfMouseMoved() {
    return this.stopClick;
  }

  destroy() {
    this.listeners.forEach(listener => listener());
  }

  private saveInitialPosition(event: MouseEvent) {
    this.stopClick = false;
    this.positionX = event.pageX;
    this.positionY = event.pageY;
  }

  private checkIfMouseMoved(event: MouseEvent) {
    if (!this.positionX || !this.positionY) {
      this.stopClick = false;
      return;
    }
    const newPositionX = event.pageX;
    const newPositionY = event.pageY;

    const newTotal = newPositionX + newPositionY;
    const oldTotal = this.positionX + this.positionY;

    this.stopClick = Math.abs(oldTotal - newTotal) > this.moveThreshold;
    this.positionX = null;
    this.positionY = null;
  }

  private doMove(event: MouseEvent) {
    if (this.stopClick) { return; }

    const button = <HTMLButtonElement>event.target;
    const buttonOffset = button.getBoundingClientRect().left;
    const buttonWidth = button.getBoundingClientRect().width;
    const headerOffset = this.header.getBoundingClientRect().left;
    const headerWidth = this.header.getBoundingClientRect().width;

    const currentPosition = buttonOffset + buttonWidth / 2;
    const moveTo = headerOffset + headerWidth / 2;

    this.header.scrollLeft += currentPosition - moveTo;
  }
}
