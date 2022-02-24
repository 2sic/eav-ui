import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature, FeatureState } from '../models/feature.model';
import { License } from '../models/license.model';

const webApiFeatures = 'admin/feature/';
const webApiLicense = 'sys/license/summary';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  // 2022-02-24 2dm @SPM TODO: probably remove, I believe it's not used any more
  // getAll() {
  //   return this.http.get<Feature[]>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'List'));
  // }

  saveFeatures(featuresStates: FeatureState[]) {
    return this.http.post<null>(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'SaveNew'), featuresStates);
  }

  getLicenses() {
    return this.http.get<License[]>(this.dnnContext.$2sxc.http.apiUrl(webApiLicense));
  }
}
