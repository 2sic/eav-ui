import { Directive, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith, tap } from 'rxjs';
import { BaseComponent } from './base.component';
import { EavLogger } from '../logging/eav-logger';

const logThis = false;

// 2024-06-12 2dm experimental - remove comments if all is good mid of June
// - previously had
// @Directive()   // Needs the @Directive() so the compiler allows OnDestroy to be implemented
// ...then tried this
// @Component({
//   selector: 'app-base-component-with-child',
//   template: ''
// })
// ...but then added abstract, so I think it doesn't actually need all that
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseWithChildDialogComponent extends BaseComponent implements OnDestroy {

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    public log?: EavLogger
  ) {
    super();
    this.log ??= new EavLogger('BaseComponent', logThis);
  }

  // 2024-06-12 2dm - don't think this is needed since it's already on the base class
  // ngOnDestroy() {
  //   super.ngOnDestroy();
  // }

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

  protected childDialogClosed$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChildBefore, hasChildNow]) => hadChildBefore && !hasChildNow),
      // tap(() => console.log('2dm ' + 'childDialogClosed$'))
    )
  }
}
