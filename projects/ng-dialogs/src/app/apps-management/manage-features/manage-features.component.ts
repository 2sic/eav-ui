import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Feature } from '../shared/feature.model';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss']
})
export class ManageFeaturesComponent implements OnInit {
  features: Feature[];

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/features`)
      .subscribe((features: Feature[]) => {
        features.forEach(feature => {
          feature.expires = new Date(feature.expires);
        });
        this.features = features;
      });
  }

}
