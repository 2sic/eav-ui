import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { AppsManagementParamsService } from '../shared/apps-management-params.service';

@Component({
  selector: 'app-apps-management-dummy',
  templateUrl: './apps-management-dummy.component.html',
  styleUrls: ['./apps-management-dummy.component.scss']
})
export class AppsManagementDummyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appsManagementParamsService: AppsManagementParamsService,
  ) {
    this.appsManagementParamsService.selectedTabPath.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
    this.subscriptions.push(
      // this component will be reinstantiated on tab change which means subscription will always fire so
      // skip first value because it's either undefined because BehaviorSubject is just created or
      // it's emitting old value if app administration was already opened and closed
      this.appsManagementParamsService.openedAppId.pipe(skip(1)).subscribe((openedAppId: number) => {
        this.router.navigate([openedAppId], { relativeTo: this.route });
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
  }
}
