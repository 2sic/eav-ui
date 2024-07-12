import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EavLogger } from '../logging/eav-logger';

// 2024-06-12 2dm experimental - remove comments if all is good mid of June
// - previously had
// @Directive()  // Needs the @Directive() so the compiler allows OnDestroy to be implemented
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
