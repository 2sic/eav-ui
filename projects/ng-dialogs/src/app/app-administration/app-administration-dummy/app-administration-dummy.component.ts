import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppAdministrationParamsService } from '../shared/app-administration-params.service';

@Component({
  selector: 'app-app-administration-dummy',
  templateUrl: './app-administration-dummy.component.html',
  styleUrls: ['./app-administration-dummy.component.scss']
})
export class AppAdministrationDummyComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private appAdministrationParamsService: AppAdministrationParamsService,
  ) {
    this.appAdministrationParamsService.selectedTabPath.next(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
  }

}
