import { Subscription } from 'rxjs';
import { EavLogger } from '../logging/eav-logger';

/** Base class for services, with logging */
export class ServiceBase
{
  protected subscriptions = new Subscription();

  constructor(public log: EavLogger) {
  }

  destroy() {
    this.subscriptions.unsubscribe();
  }

}