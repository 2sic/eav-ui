import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppAdministrationParamsService } from '../shared/services/app-administration-params.service';

@Component({
  selector: 'app-app-administration-host-tab-picker',
  templateUrl: './app-administration-host-tab-picker.component.html',
  styleUrls: ['./app-administration-host-tab-picker.component.scss']
})
export class AppAdministrationHostTabPickerComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private appAdministrationParamsService: AppAdministrationParamsService,
  ) {
    this.appAdministrationParamsService.selectedTabPath$$.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
  }

}
