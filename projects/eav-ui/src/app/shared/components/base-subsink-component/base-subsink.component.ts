import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseSubsinkComponent implements OnDestroy {
  protected subscription: Subscription;

  constructor() {
    this.subscription = new Subscription();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
