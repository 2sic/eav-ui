import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
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
 * Helper to handle dialog routings, especially:
 * 1. handling on-child-closed events (it also takes care of subscriptions)
 * 2. accessing the router and route - a very common task when you have dialogs
 */
@Injectable()
export class DialogRoutingService extends ServiceWithSubscriptions implements OnDestroy {

  log = new EavLogger(logSpecs);

  constructor(
    public router: Router,
    public route: ActivatedRoute
  ) {
    super();
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  get snapshot() { return this.route.snapshot; }

  /**
   * Preferred way to register a callback, since the caller doesn't need to worry about subscriptions.
   */
  public doOnDialogClosed(callback: () => void) {
    const l = this.log.fnIf('doOnDialogClosed');
    this.subscriptions.add(
      this.#childDialogClosed$().subscribe(() => { callback(); })
    );
    l.end();
  }

  /**
   * Navigate relative to the current route.
   */
  public navRelative(commands: any[]): Promise<boolean> {
    return this.router.navigate(commands, { relativeTo: this.route });
  }

  public navParentFirstChild(commands: any[], extras?: Omit<NavigationExtras, 'relativeTo'>): Promise<boolean> {
    return this.router.navigate(commands, { ...extras, relativeTo: this.route.parent.firstChild });
  }
  
  #childDialogClosed$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChildBefore, hasChildNow]) => hadChildBefore && !hasChildNow),
    )
  }


}
