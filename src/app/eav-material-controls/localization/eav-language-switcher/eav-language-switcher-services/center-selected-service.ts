import { Injectable, Renderer2, ElementRef, QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CenterSelectedService {
  private header: HTMLElement;
  private renderer: Renderer2;
  private positionX: number;
  private positionY: number;
  private moveThreshold = 2; // Pixels for which header can be scrolled while clicking to still register as click
  private stopClick = false;

  constructor() { }

  initCenterSelected(renderer: Renderer2, headerRef: ElementRef, buttonsRef: QueryList<ElementRef>): void {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
    const buttons = [];
    buttonsRef.forEach(element => {
      buttons.push(element.nativeElement);
    });

    buttons.forEach(button => {
      this.renderer.listen(button, 'mousedown', this.saveInitialPosition.bind(this));
      this.renderer.listen('document', 'mouseup', this.checkIfMouseMoved.bind(this));
      this.renderer.listen(button, 'click', this.doMove.bind(this));
    });
  }

  stopClickIfMouseMoved() {
    return this.stopClick;
  }

  private saveInitialPosition(event: any): void {
    this.stopClick = false;
    this.positionX = event.pageX;
    this.positionY = event.pageY;
  }

  private checkIfMouseMoved(event: any): void {
    const newPositionX = event.pageX;
    const newPositionY = event.pageY;

    const newTotal = newPositionX + newPositionY;
    const oldTotal = this.positionX + this.positionY;

    this.stopClick = Math.abs(oldTotal - newTotal) > this.moveThreshold;
  }

  private doMove(event: any): void {
    if (this.stopClick) {
      return;
    }

    const button = event.target;
    const buttonOffset = button.getBoundingClientRect().left;
    const buttonWidth = button.getBoundingClientRect().width;
    const headerOffset = this.header.getBoundingClientRect().left;
    const headerWidth = this.header.getBoundingClientRect().width;

    const currentPosition = buttonOffset + buttonWidth / 2;
    const moveTo = headerOffset + headerWidth / 2;

    this.header.scrollLeft += currentPosition - moveTo;
  }
}
