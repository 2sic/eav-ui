import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Feature } from '../models';
import { HttpServiceBase } from '../../shared/services/http-service-base';

export const webApiRoot = "admin/feature/";

@Injectable()
export class FeatureDetailService extends HttpServiceBase {

  getFeatureDetails(featureNameId: string): Observable<Feature> {
    return this.http.get<Feature>(this.apiUrl(webApiRoot + 'details'), {
      params: { nameId: featureNameId }
    });
  }
}
