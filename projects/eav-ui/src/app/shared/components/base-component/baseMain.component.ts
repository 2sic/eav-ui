import { Directive, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith, Subscription } from 'rxjs';

@Directive()
// sdv TODO rename this class to BaseComponent when BaseComponent gets renamed to BaseFieldComponent
// tslint:disable-next-line:directive-class-suffix
export class BaseMainComponent implements OnDestroy {
  subscription: Subscription;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.subscription = new Subscription();
   }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  protected refreshOnChildClosed() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild.firstChild),
      map(() => !!this.route.snapshot.firstChild.firstChild),
      pairwise(),
      filter(([hadChild, hasChild]) => hadChild && !hasChild),
    )
  }
}
