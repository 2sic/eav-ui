import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({
    selector: '[appChangeAnchorTarget]',
    standalone: true
})
export class ChangeAnchorTargetDirective implements OnInit, OnDestroy {
  private target = '_blank';
  private element: HTMLElement;
  private observer: MutationObserver;

  constructor(elementRef: ElementRef, private zone: NgZone) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.setAnchorTargets();
      this.observer = new MutationObserver((mutations: MutationRecord[]) => {
        this.setAnchorTargets();
      });
      this.observer.observe(this.element, { attributes: true, childList: true, subtree: true });
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.observer.disconnect();
    });
  }

  private setAnchorTargets() {
    if (this.element.nodeName.toLocaleLowerCase() === 'a') {
      const anchor = this.element as HTMLAnchorElement;
      if (anchor.target !== this.target) {
        anchor.target = this.target;
      }
    }
    const childAnchors = this.element.getElementsByTagName('a');
    for (const anchor of Array.from(childAnchors)) {
      if (anchor.target !== this.target) {
        anchor.target = this.target;
      }
    }
  }
}
