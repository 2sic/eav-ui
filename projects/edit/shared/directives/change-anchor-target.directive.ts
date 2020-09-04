import { Directive, ElementRef, OnInit, OnDestroy, NgZone } from '@angular/core';

@Directive({ selector: '[appChangeAnchorTarget]' })
export class ChangeAnchorTargetDirective implements OnInit, OnDestroy {
  private target = '_blank';
  private element: HTMLElement;
  private observer: MutationObserver;

  constructor(elementRef: ElementRef, private zone: NgZone) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.observer = new MutationObserver((mutations: MutationRecord[]) => {
        if (this.element.tagName === 'A') {
          const anchor = this.element as HTMLAnchorElement;
          if (anchor.target !== this.target) {
            anchor.target = this.target;
          }
        }
        const childAnchors = this.element.getElementsByTagName('a');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < childAnchors.length; i++) {
          const anchor = childAnchors[i];
          if (anchor.target !== this.target) {
            anchor.target = this.target;
          }
        }
      });
      this.observer.observe(this.element, { childList: true, subtree: true });
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.observer.disconnect();
    });
  }
}
