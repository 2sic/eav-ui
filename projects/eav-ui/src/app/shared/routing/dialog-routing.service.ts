import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { filter, map, pairwise, startWith } from 'rxjs';
import { Injectable } from '@angular/core';
import { ServiceBase } from '../services/service-base';
import { classLog } from '../logging';

const logSpecs = {
  doOnDialogClosed: true,
};

/**
 * Helper to handle dialog routings, especially:
 * 1. handling on-child-closed events (it also takes care of subscriptions)
 * 2. accessing the router and route - a very common task when you have dialogs
 */
@Injectable()
export class DialogRoutingService extends ServiceBase {

  log = classLog({DialogRoutingService}, logSpecs);

  constructor(
    public router: Router,
    public route: ActivatedRoute
  ) {
    super();
  }

  get snapshot() { return this.route.snapshot; }

  get url() { return this.router.url; }

  state<T = any>() { return this.router.getCurrentNavigation().extras?.state as T; }

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

  /**
   * Navigate to a new route.
   * Just looks a bit simpler than the internal array notation.
   */
  public navPath(url: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([url], extras);
  }

  /**
   * Navigate relative to the current route.
   */
  public navRelative(commands: any[], extras?: Omit<NavigationExtras, 'relativeTo'>): Promise<boolean> {
    return this.router.navigate(commands, { ...extras, relativeTo: this.route });
  }

  public navParentFirstChild(commands: any[], extras?: Omit<NavigationExtras, 'relativeTo'>): Promise<boolean> {
    return this.router.navigate(commands, { ...extras, relativeTo: this.route.parent.firstChild });
  }
  
  childDialogClosed$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChildBefore, hasChildNow]) => hadChildBefore && !hasChildNow),
    )
  }


}
