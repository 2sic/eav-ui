import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * This directive will fix all html inside it so that links open in a new tab.
 */
@Directive({
  selector: '[appChangeAnchorTarget]',
  standalone: true
})
export class ChangeAnchorTargetDirective implements OnInit, OnDestroy {
  #target = '_blank';
  #element: HTMLElement;
  #observer: MutationObserver;

  constructor(elementRef: ElementRef, private zone: NgZone) {
    this.#element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.#setAnchorTargets();
      this.#observer = new MutationObserver((_: unknown) => {
        this.#setAnchorTargets();
      });
      this.#observer.observe(this.#element, { attributes: true, childList: true, subtree: true });
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => this.#observer.disconnect());
  }

  #setAnchorTargets() {
    if (this.#element.nodeName.toLocaleLowerCase() === 'a') {
      const anchor = this.#element as HTMLAnchorElement;
      if (anchor.target !== this.#target)
        anchor.target = this.#target;
    }
    const childAnchors = this.#element.getElementsByTagName('a');
    for (const anchor of Array.from(childAnchors))
      if (anchor.target !== this.#target)
        anchor.target = this.#target;
  }
}
