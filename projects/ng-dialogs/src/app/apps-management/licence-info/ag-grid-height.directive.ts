import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({ selector: '[appAgGridHeight]' })
export class AgGridHeightDirective implements OnChanges {
  @Input() itemsCount = 0;

  private element: HTMLElement;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemsCount != null) {
      const headerHeight = 32;
      const rowHeight = 48;
      const extra = 2;
      const maxRows = 4;
      const rows = this.itemsCount === 0 ? 2 : this.itemsCount > maxRows ? maxRows : this.itemsCount;
      this.element.style.height = `${headerHeight + rows * rowHeight + extra}px`;
    }
  }
}
