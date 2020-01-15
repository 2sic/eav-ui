import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Feature } from '../models/feature.model';

@Injectable()
export class FeaturesConfigService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll() {
    return <Observable<Feature[]>>this.http.get(`/desktopmodules/2sxc/api/app-sys/system/features`);
  }

  getManageFeaturesUrl() {
    return <Observable<string>>this.http.get(`/desktopmodules/2sxc/api/app-sys/system/managefeaturesurl`);
  }

  saveFeatures(featuresString: string) {
    return <Observable<boolean>>this.http.post(`/desktopmodules/2sxc/api/app-sys/system/SaveFeatures`, featuresString);
  }
}
