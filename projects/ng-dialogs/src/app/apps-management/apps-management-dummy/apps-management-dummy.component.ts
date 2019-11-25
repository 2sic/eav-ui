import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppsManagementParamsService } from '../shared/apps-management-params.service';

@Component({
  selector: 'app-apps-management-dummy',
  templateUrl: './apps-management-dummy.component.html',
  styleUrls: ['./apps-management-dummy.component.scss']
})
export class AppsManagementDummyComponent implements OnInit {
  openedAppId: number;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private appsManagementParamsService: AppsManagementParamsService,
  ) {
    this.appsManagementParamsService.selectedTabPath.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
    this.appsManagementParamsService.openedAppId.subscribe((openedAppId: number) => {
      if (openedAppId === this.openedAppId) { return; }
      this.router.navigate([openedAppId], { relativeTo: this.route });
    });
  }
}
