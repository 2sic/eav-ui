import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Base class for services - just to standardize use of subscriptions.
 * Has @Injectable() just to allow it ot use the standard OnDestroy interface.
 */
@Injectable()
export abstract class ServiceBase implements OnDestroy {

  protected subscriptions = new Subscription();

  ngOnDestroy(): void {
    this.destroy();
  }

  // TODO: TRY TO GET RID OF THIS. AFAIK it's just used in the mask, which should switch over to signals.
  destroy() {
    this.subscriptions.unsubscribe();
  }
}
