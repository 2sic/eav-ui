import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Feature } from '../models/feature.model';

@Injectable()
export class FeaturesConfigService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return <Observable<Feature[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/features'));
  }

  getManageFeaturesUrl() {
    return <Observable<string>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/managefeaturesurl'));
  }

  saveFeatures(featuresString: string) {
    return <Observable<boolean>>this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/SaveFeatures'), featuresString);
  }
}
