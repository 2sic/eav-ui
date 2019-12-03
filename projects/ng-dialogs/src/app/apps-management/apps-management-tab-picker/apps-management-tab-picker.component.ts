import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppsManagementParamsService } from '../shared/services/apps-management-params.service';

@Component({
  selector: 'app-apps-management-tab-picker',
  templateUrl: './apps-management-tab-picker.component.html',
  styleUrls: ['./apps-management-tab-picker.component.scss']
})
export class AppsManagementTabPickerComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private appsManagementParamsService: AppsManagementParamsService,
  ) {
    this.appsManagementParamsService.selectedTabPath$$.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
  }

}
