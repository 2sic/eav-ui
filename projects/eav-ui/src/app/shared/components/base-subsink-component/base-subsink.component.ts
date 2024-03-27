import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// @2SDV TODO verify directive
@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseSubsinkComponent implements OnDestroy {
  // @2SDV TODO: rename to subscriptions
  protected subscription = new Subscription();

  constructor() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
