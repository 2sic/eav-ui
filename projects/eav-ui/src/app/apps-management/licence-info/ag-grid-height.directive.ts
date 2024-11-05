import { Directive, ElementRef, input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAgGridHeight]',
  standalone: true
})
export class AgGridHeightDirective implements OnChanges {
  itemsCount = input<number>(0);
  headerHeight = input<number>(32);
  rowHeight = input<number>(48);
  maxRows = input<number>(100);

  /** Fixes a bug where scrollbar appears when then is no overflow */
  private extraHeight = 2;

  private element: HTMLElement;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemsCount != null) {
      const rows = this.itemsCount() === 0 ? 2 : this.itemsCount() > this.maxRows() ? this.maxRows() : this.itemsCount();
      this.element.style.height = `${this.headerHeight() + rows * this.rowHeight() + this.extraHeight}px`;
    }
  }
}
