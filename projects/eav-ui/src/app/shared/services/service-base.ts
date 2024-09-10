import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/** Base class for services, withOUT logging */
@Injectable()
export abstract class ServiceBase implements OnDestroy {

  protected subscriptions = new Subscription();

  // todo use this instead
  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    this.subscriptions.unsubscribe();
  }

  // Note: we can't do this, because angular compiler complains about wanting to implement OnDestroy
  // and if we do that, it will want a decorator, which we can't have here.
  // ngOnDestroy() {
  //   this.destroy();
  // }

}
