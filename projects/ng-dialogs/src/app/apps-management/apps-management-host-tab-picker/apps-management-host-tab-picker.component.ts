import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppsManagementParamsService } from '../shared/apps-management-params.service';

@Component({
  selector: 'app-apps-management-host-tab-picker',
  templateUrl: './apps-management-host-tab-picker.component.html',
  styleUrls: ['./apps-management-host-tab-picker.component.scss']
})
export class AppsManagementHostTabPickerComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private appsManagementParamsService: AppsManagementParamsService,
  ) {
    this.appsManagementParamsService.selectedTabPath$$.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
  }

}
