import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({ selector: '[appAgGridHeight]' })
export class AgGridHeightDirective implements OnChanges {
  @Input() itemsCount = 0;
  @Input() headerHeight = 32;
  @Input() rowHeight = 48;
  @Input() maxRows = 100;

  /** Fixes a bug where scrollbar appears when then is no overflow */
  private extraHeight = 2;

  private element: HTMLElement;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemsCount != null) {
      const rows = this.itemsCount === 0 ? 2 : this.itemsCount > this.maxRows ? this.maxRows : this.itemsCount;
      this.element.style.height = `${this.headerHeight + rows * this.rowHeight + this.extraHeight}px`;
    }
  }
}
