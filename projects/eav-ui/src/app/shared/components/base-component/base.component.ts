import { Directive, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith, Subscription } from 'rxjs';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseComponent implements OnDestroy {
  subscription: Subscription;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    this.subscription = new Subscription();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  protected refreshOnChildClosedDeep() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild.firstChild),
      map(() => !!this.route.snapshot.firstChild.firstChild),
      pairwise(),
      filter(([hadChild, hasChild]) => hadChild && !hasChild),
    )
  }

  protected refreshOnChildClosedShallow() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChild, hasChild]) => hadChild && !hasChild),
    )
  }
}
