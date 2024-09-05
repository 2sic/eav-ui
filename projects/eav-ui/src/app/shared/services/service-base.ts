import { Subscription } from 'rxjs';
import { EavLogger } from '../logging/eav-logger';

/** Base class for services, withOUT logging */
export class ServiceWithSubscriptions {
  protected subscriptions = new Subscription();

  destroy() {
    this.subscriptions.unsubscribe();
  }

  // Note: we can't do this, because angular compiler complains about wanting to implement OnDestroy
  // and if we do that, it will want a decorator, which we can't have here.
  // ngOnDestroy() {
  //   this.destroy();
  // }

}

/** Base class for services, with logging */
export class ServiceBase extends ServiceWithSubscriptions {

  constructor(public log: EavLogger) {
    super();
  }
}
