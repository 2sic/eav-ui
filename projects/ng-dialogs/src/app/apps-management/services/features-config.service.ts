import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Feature } from '../models/feature.model';

const webApiFeatures = 'admin/feature/';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'List')) as Observable<Feature[]>;
  }

  getManageFeaturesUrl() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'RemoteManageUrl')) as Observable<string>;
  }

  saveFeatures(featuresString: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiFeatures + 'Save'), featuresString) as Observable<boolean>;
  }
}
