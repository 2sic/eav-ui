import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Feature } from '../models/feature.model';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/features')) as Observable<Feature[]>;
  }

  getManageFeaturesUrl() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/managefeaturesurl')) as Observable<string>;
  }

  saveFeatures(featuresString: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/SaveFeatures'), featuresString) as Observable<boolean>;
  }
}
