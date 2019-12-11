import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FeaturesConfigService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/features`);
  }

  getManageFeaturesUrl() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/managefeaturesurl`);
  }

  saveFeatures(featuresString: string) {
    return this.http.post(`/desktopmodules/2sxc/api/app-sys/system/SaveFeatures`, featuresString);
  }
}
