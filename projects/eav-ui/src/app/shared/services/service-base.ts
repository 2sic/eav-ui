import { Subscription } from 'rxjs';

/** Base class for services, withOUT logging */
export class ServiceBase {
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
