import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EavLogger } from '../logging/eav-logger';

/**
 * Base component class that provides a logger and handles subscriptions.
 * 
 * Note that as with time, we wish to get away from these, as we don't want to use many observables any more.
 */
@Component({
  selector: 'app-base-component',
  template: ''
})
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseComponent implements OnDestroy {
  
  /** Holds all subscriptions to be unsubscribed on destroy */
  protected subscriptions = new Subscription();

  constructor(public log?: EavLogger) {
    this.log ??= new EavLogger('BaseComponent', false);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}

/**
 * A newer base component, without Log being created / requested.
 * This is so it's easier to inherit than the BaseComponent,
 * which would make typed log with specs harder to implement.
 * 
 * Note that as with time, we wish to get away from these, as we don't want to use many observables any more.
 */
@Component({
  selector: 'app-base-component-subscriptions',
  template: ''
})
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseComponentSubscriptions implements OnDestroy {
  
  /** Holds all subscriptions to be unsubscribed on destroy */
  protected subscriptions = new Subscription();

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
