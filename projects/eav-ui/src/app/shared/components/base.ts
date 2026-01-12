import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * A newer base component, without Log being created / requested.
 * This is so it's easier to inherit than the BaseComponent,
 * which would make typed log with specs harder to implement.
 * 
 * Note that as with time, we wish to get away from these, as we don't want to use many observables any more.
 */
@Component({
  selector: 'app-base',
  template: '',
})
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseComponent implements OnDestroy {
  
  /** Holds all subscriptions to be unsubscribed on destroy */
  protected subscriptions = new Subscription();

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
