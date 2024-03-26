import { Directive, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith } from 'rxjs';
import { BaseSubsinkComponent } from '../base-subsink-component/base-subsink.component';
import { EavLogger } from '../../logging/eav-logger';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseComponent extends BaseSubsinkComponent implements OnDestroy {

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    public log?: EavLogger
  ) {
    super();
    this.log ??= new EavLogger('BaseComponent', false);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  // TODO @2dg not longer in use after refactoring SideNav with Routing
  // protected refreshOnChildClosedDeep() {
  //   return this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd),
  //     startWith(!!this.route.snapshot.firstChild.firstChild),
  //     map(() => !!this.route.snapshot.firstChild.firstChild),
  //     pairwise(),
  //     filter(([hadChild, hasChild]) => hadChild && !hasChild),
  //   )
  // }

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
