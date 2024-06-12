import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseDirective implements OnDestroy {
  /** Holds all subscriptions to be unsubscribed on destroy */
  protected subscriptions = new Subscription();

  constructor() {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
