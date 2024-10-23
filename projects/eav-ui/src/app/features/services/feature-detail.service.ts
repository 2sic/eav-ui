import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Feature } from '../models';

const webApiFeatureDetails = "admin/feature/details";

@Injectable()
export class FeatureDetailService extends HttpServiceBase {

  getFeatureDetails(nameId: string): Observable<Feature> {
    return this.getHttpApiUrl<Feature>(webApiFeatureDetails, {
      params: { nameId }
    });
  }

  getFeatureDetailsSig(nameId: string): Signal<Feature> {
    return this.getSignal<Feature>(webApiFeatureDetails, {
      params: { nameId }
    });
  }
}
