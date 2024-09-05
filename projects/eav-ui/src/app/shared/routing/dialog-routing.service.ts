import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith } from 'rxjs';
import { EavLogger } from '../logging/eav-logger';
import { Injectable, OnDestroy } from '@angular/core';
import { ServiceWithSubscriptions } from '../services/service-base';

const logSpecs = {
  enabled: true,
  name: 'DialogRoutingService',
  specs: {
    doOnDialogClosed: true,
  }
};

/**
 * Helper to handle opening / closing field-specific popups.
 */
@Injectable()
export class DialogRoutingService extends ServiceWithSubscriptions implements OnDestroy {

  log = new EavLogger(logSpecs);

  constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super();
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  /**
   * Preferred way to register a callback, since the caller doesn't need to worry about subscriptions.
   */
  public doOnDialogClosed(callback: () => void) {
    const l = this.log.fnIf('doOnDialogClosed');
    this.subscriptions.add(
      this.childDialogClosed$().subscribe(() => { callback(); })
    );
    l.end();
  }
  
  public childDialogClosed$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChildBefore, hasChildNow]) => hadChildBefore && !hasChildNow),
    )
  }


}
