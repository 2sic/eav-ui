import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { filter, map, pairwise, startWith, tap } from 'rxjs';
import { classLogEnabled } from '../logging';
import { ServiceBase } from '../services/service-base';

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

  log = classLogEnabled({ DialogRoutingService }, logSpecs);

  constructor(
    public router: Router,
    public route: ActivatedRoute
  ) { super(); }

  get snapshot() { return this.route.snapshot; }

  get url() { return this.router.url; }

  get urlSegments() { return this.router.url.split('/'); }

  getParam(key: string): string {
    return this.route.snapshot.paramMap.get(key);
  }

  getParams<K extends string>(keys: K[]): Record<K, string> {
    const paramMap = this.route.snapshot.paramMap;
    return keys.reduce((acc, key) => {
      acc[key] = paramMap.get(key);
      return acc;
    }, {} as Record<string, string>);
  }

  getQueryParam(key: string): string {
    return this.route.snapshot.queryParamMap.get(key);
  }

  getQueryParams<K extends string>(keys: K[]): Record<K, string> {
    const queryParamMap = this.route.snapshot.queryParamMap;
    return keys.reduce((acc, key) => {
      acc[key] = queryParamMap.get(key);
      return acc;
    }, {} as Record<string, string>);
  }

  state<T = any>() { return this.router.getCurrentNavigation().extras?.state as T; }

  /**
   * Preferred way to register a callback, since the caller doesn't need to worry about subscriptions.
   */
  public doOnDialogClosed(callback: () => void) {
    console.log('2dg doOnDialogClosed-OLD', { callback });
    const l = this.log.fnIf('doOnDialogClosed');
    this.subscriptions.add(
      this.childDialogClosed$().subscribe((data: unknown) => {
        l.a('Dialog closed', { data });
        return callback();
      })
    );
    l.end();
  }

  // TODO: @2dg test, remove later
  public doOnDialogClosedWithData(callback: (result: any) => void) {
    console.log('2dg doOnDialogClosedWithData', { callback });
    const l = this.log.fnIf('doOnDialogClosed');
    this.subscriptions.add(
      this.childDialogClosed$().subscribe(result => callback(result))
    );
    l.end();
  }


  /**
   * Get the URL for a sub-route of the current route.
   */
  public urlSubRoute(params: string) {
    const tree = this.router.createUrlTree([params], { relativeTo: this.route });
    const routeUrl = this.router.serializeUrl(tree);
    return routeUrl;
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

  childDialogClosed$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(event => {
        const l = this.log.fn("childDialogClosed$", {
          event,
          firstChild: this.route.snapshot.firstChild,
          snapShot: this.route.snapshot,
        });
        l.a('NavigationEnd', { event });
        l.end();
      }),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChildBefore, hasChildNow]) => hadChildBefore && !hasChildNow),
    )
  }
}
