import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { App } from '../../shared/models/app.model';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit {
  apps: App[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    // http://petar-pc2.sistemi.corp/en-us/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=2
    let zoneId: string;
    try {
      zoneId = this.route.parent.snapshot.paramMap.get('zoneId');
    }
    catch (error) {
      zoneId = '2';
    }
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${zoneId}`)
      .subscribe((apps: App[]) => {
        this.apps = apps;
      });
  }

  openApp(appId: number) {
    this.router.navigate([`${appId}`], { relativeTo: this.route });
  }

}
