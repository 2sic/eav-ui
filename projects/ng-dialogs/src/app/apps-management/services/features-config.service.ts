import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeatureState } from '../manage-features-wip/manage-features-wip.models';
import { Feature } from '../models/feature.model';

const webApiFeatures = 'admin/feature/';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get<Feature[]>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'List'));
  }

  getManageFeaturesUrl() {
    return this.http.get<string>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'RemoteManageUrl'));
  }

  saveFeatures(featuresString: string) {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'Save'), featuresString);
  }

  saveFeaturesNew(featuresStates: FeatureState[]) {
    return this.http.post<null>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'SaveNew'), featuresStates);
  }
}
