import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Feature } from '../models';

export const webApiRoot = "admin/feature/";

@Injectable()
export class FeatureDetailService {
  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext
  ) { }

  getFeatureDetails(featureNameId: string): Observable<Feature> {
    return this.http.get<Feature>(this.dnnContext.$2sxc.http.apiUrl(webApiRoot + 'details'), {
      params: { nameId: featureNameId }
    });
  }
}
