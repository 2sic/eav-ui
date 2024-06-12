import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()  // Needs the @Directive() so the compiler allows OnDestroy to be implemented
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
