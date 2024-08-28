import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[appMatFormFieldTextarea]', standalone: true })
export class MatFormFieldTextareaDirective implements OnInit, OnDestroy {
  private observer: ResizeObserver;
  private debounce = 500;
  private oldResizeTime = 0;

  constructor(private elementRef: ElementRef<HTMLElement>, private zone: NgZone) { }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const matFormField = this.elementRef.nativeElement;
      this.observer = new ResizeObserver(() => {
        const newResizeTime = Date.now();
        if (newResizeTime - this.oldResizeTime < this.debounce) { return; }
        this.oldResizeTime = newResizeTime;

        const textarea = matFormField.querySelector('textarea');
        const maxHeight = Math.floor((matFormField.getBoundingClientRect().height - 30) / 10) * 10;
        textarea.style.height = `${maxHeight}px`;
      });
      this.observer.observe(matFormField);
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => this.observer?.disconnect());
  }
}
