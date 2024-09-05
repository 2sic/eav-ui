import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith } from 'rxjs';
import { BaseComponentSubscriptions } from './base.component';
import { EavLogger } from '../logging/eav-logger';

const logSpecs = {
  enabled: true,
  name: 'BaseWithChildDialogComponent',
};

export abstract class BaseWithChildDialogComponent extends BaseComponentSubscriptions {

  log = new EavLogger(logSpecs);
  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    log?: EavLogger
  ) {
    super();
    this.log = log ?? this.log;
  }

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
