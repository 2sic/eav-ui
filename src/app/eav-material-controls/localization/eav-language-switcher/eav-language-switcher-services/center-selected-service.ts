import { Injectable, Renderer2, ElementRef, QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CenterSelectedService {
  private header: HTMLElement;
  private renderer: Renderer2;
  private positionX: number;
  private positionY: number;
  private moveThreshold: number;

  constructor() {
    this.moveThreshold = 2;
  }

  initCenterSelected(renderer: Renderer2, headerRef: ElementRef, buttonsRef: QueryList<ElementRef>): void {
    this.renderer = renderer;
    this.header = headerRef.nativeElement;
    const buttons = [];
    buttonsRef.forEach(element => {
      buttons.push(element.nativeElement);
    });

    buttons.forEach(button => {
      this.renderer.listen(button, 'mousedown', this.saveInitialPosition.bind(this));
      this.renderer.listen(button, 'click', this.doMove.bind(this));
    });
  }

  private saveInitialPosition(event: any): void {
    this.positionX = event.pageX;
    this.positionY = event.pageY;
  }

  private stopIfMouseMoved(event: any): boolean {
    const newPositionX = event.pageX;
    const newPositionY = event.pageY;

    const newTotal = newPositionX + newPositionY;
    const oldTotal = this.positionX + this.positionY;

    if (Math.abs(oldTotal - newTotal) > this.moveThreshold) {
      return true;
    }
    return false;
  }

  private doMove(event: any): void {
    const stop = this.stopIfMouseMoved(event);
    if (stop) {
      return;
    }
    console.log('Petar doMove');

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
